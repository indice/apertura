import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "openai";
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RAGService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-3-small"
    });

    this.openai = new OpenAI({
      apiKey: apiKey
    });

    this.vectorStore = null;
    this.dbPath = path.join(__dirname, 'knowledge.db');
    this.vectorStorePath = path.join(__dirname, 'vectorstore');
  }

  async initializeVectorStore() {
    try {
      // Intentar cargar vector store existente
      if (fs.existsSync(this.vectorStorePath)) {
        console.log('📚 Cargando vector store existente...');
        this.vectorStore = await HNSWLib.load(
          this.vectorStorePath,
          this.embeddings
        );
      } else {
        console.log('🔨 Creando nuevo vector store...');
        await this.buildVectorStore();
      }
    } catch (error) {
      console.error('Error inicializando vector store:', error);
      throw error;
    }
  }

  async buildVectorStore() {
    try {
      // Obtener todos los conocimientos de la base de datos
      const knowledgeData = await this.getAllKnowledge();

      if (knowledgeData.length === 0) {
        console.log('⚠️ No hay datos para indexar');
        return;
      }

      // Preparar documentos para embeddings
      const documents = [];
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      for (const item of knowledgeData) {
        const content = `
Título: ${item.titulo || ''}
Categoría: ${item.categoria || ''}
Contenido: ${item.contenido || ''}
Palabras clave: ${item.pclave || ''}
URLs: ${item.urls || ''}
        `.trim();

        const chunks = await textSplitter.createDocuments(
          [content],
          [{
            id: item.id,
            titulo: item.titulo,
            categoria: item.categoria
          }]
        );

        documents.push(...chunks);
      }

      // Crear vector store
      this.vectorStore = await HNSWLib.fromDocuments(
        documents,
        this.embeddings
      );

      // Guardar vector store
      await this.vectorStore.save(this.vectorStorePath);
      console.log(`✅ Vector store creado con ${documents.length} chunks`);
    } catch (error) {
      console.error('Error construyendo vector store:', error);
      throw error;
    }
  }

  async rebuildVectorStore() {
    // Eliminar vector store existente
    if (fs.existsSync(this.vectorStorePath)) {
      fs.rmSync(this.vectorStorePath, { recursive: true, force: true });
    }

    await this.buildVectorStore();
  }

  async search(query, k = 5) {
    if (!this.vectorStore) {
      throw new Error('Vector store no inicializado');
    }

    try {
      const results = await this.vectorStore.similaritySearchWithScore(query, k);

      return results.map(([doc, score]) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score: score
      }));
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }
  }

  async generateResponse(query, context) {
    try {
      const systemPrompt = `Eres un asistente útil que responde preguntas basándose en el contexto proporcionado.
Si la respuesta no está en el contexto, dilo claramente.
Responde en español de manera clara y concisa.`;

      const userPrompt = `
Contexto:
${context.map(item => item.content).join('\n\n---\n\n')}

Pregunta: ${query}

Respuesta:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generando respuesta:', error);
      throw error;
    }
  }

  async chat(query) {
    try {
      // Buscar contexto relevante
      const context = await this.search(query, 3);

      if (context.length === 0) {
        return {
          response: "No encontré información relevante en la base de conocimientos.",
          sources: []
        };
      }

      // Generar respuesta
      const response = await this.generateResponse(query, context);

      // Obtener IDs únicos de las fuentes
      const sourceIds = [...new Set(context.map(c => c.metadata.id))];

      // Obtener detalles de las fuentes
      const sources = await Promise.all(
        sourceIds.map(id => this.getKnowledgeById(id))
      );
      const validSources = sources.filter(Boolean);

      return {
        response,
        sources: validSources,
        context: context.map(c => ({
          content: c.content.substring(0, 200) + '...',
          score: c.score
        }))
      };
    } catch (error) {
      console.error('Error en chat:', error);
      throw error;
    }
  }

  // Métodos auxiliares para base de datos
  getAllKnowledge() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY);
      db.all(
        `SELECT id, titulo, contenido, categoria, pclave, urls FROM knowledge`,
        [],
        (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  getKnowledgeById(id) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY);
      db.get(
        `SELECT id, titulo, categoria, contenido FROM knowledge WHERE id = ?`,
        [id],
        (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
}

export default RAGService;