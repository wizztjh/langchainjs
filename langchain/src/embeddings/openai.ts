import { Configuration, OpenAIApi, CreateEmbeddingRequest } from "openai";
import fetchAdapter from "../util/axios-fetch-adapter.js";
import { chunkArray } from "../util/index.js";
import { Embeddings, EmbeddingsParams } from "./base.js";

interface ModelParams {
  modelName: string;
}

export class OpenAIEmbeddings extends Embeddings implements ModelParams {
  modelName = "text-embedding-ada-002";

  batchSize = 20;

  private apiKey: string;

  private client: OpenAIApi;

  constructor(
    fields?: Partial<ModelParams> &
      EmbeddingsParams & {
        verbose?: boolean;
        batchSize?: number;
        openAIApiKey?: string;
      }
  ) {
    super(fields ?? {});

    const apiKey = fields?.openAIApiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    this.modelName = fields?.modelName ?? this.modelName;
    this.batchSize = fields?.batchSize ?? this.batchSize;
    this.apiKey = apiKey;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const subPrompts = chunkArray(texts, this.batchSize);

    const embeddings = [];

    for (let i = 0; i < subPrompts.length; i += 1) {
      const input = subPrompts[i];
      const { data } = await this.embeddingWithRetry({
        model: this.modelName,
        input,
      });
      for (let j = 0; j < input.length; j += 1) {
        embeddings.push(data.data[j].embedding);
      }
    }

    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const { data } = await this.embeddingWithRetry({
      model: this.modelName,
      input: text,
    });
    return data.data[0].embedding;
  }

  private async embeddingWithRetry(request: CreateEmbeddingRequest) {
    if (!this.client) {
      const clientConfig = new Configuration({
        apiKey: this.apiKey,
        baseOptions: { adapter: fetchAdapter },
      });
      this.client = new OpenAIApi(clientConfig);
    }
    return this.caller.call(
      this.client.createEmbedding.bind(this.client),
      request
    );
  }
}
