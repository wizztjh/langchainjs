import {
  AgentAction,
  AgentFinish,
  ChainValues,
  LLMResult,
} from "../schema/index.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Error = any;

export interface BaseCallbackHandlerInput {
  alwaysVerbose?: boolean;
  ignoreLLM?: boolean;
  ignoreChain?: boolean;
  ignoreAgent?: boolean;
}

export abstract class BaseCallbackHandler implements BaseCallbackHandlerInput {
  alwaysVerbose = false;

  ignoreLLM = false;

  ignoreChain = false;

  ignoreAgent = false;

  constructor(input?: BaseCallbackHandlerInput) {
    if (input) {
      this.alwaysVerbose = input.alwaysVerbose ?? this.alwaysVerbose;
      this.ignoreLLM = input.ignoreLLM ?? this.ignoreLLM;
      this.ignoreChain = input.ignoreChain ?? this.ignoreChain;
      this.ignoreAgent = input.ignoreAgent ?? this.ignoreAgent;
    }
  }

  handleLLMStart?(
    llm: { name: string },
    prompts: string[],
    verbose?: boolean
  ): Promise<void>;

  handleLLMNewToken?(token: string, verbose?: boolean): Promise<void>;

  handleLLMError?(err: Error, verbose?: boolean): Promise<void>;

  handleLLMEnd?(output: LLMResult, verbose?: boolean): Promise<void>;

  handleChainStart?(
    chain: { name: string },
    inputs: ChainValues,
    verbose?: boolean
  ): Promise<void>;

  handleChainError?(err: Error, verbose?: boolean): Promise<void>;

  handleChainEnd?(outputs: ChainValues, verbose?: boolean): Promise<void>;

  handleToolStart?(
    tool: { name: string },
    input: string,
    verbose?: boolean
  ): Promise<void>;

  handleToolError?(err: Error, verbose?: boolean): Promise<void>;

  handleToolEnd?(output: string, verbose?: boolean): Promise<void>;

  handleText?(text: string, verbose?: boolean): Promise<void>;

  handleAgentAction?(action: AgentAction, verbose?: boolean): Promise<void>;

  handleAgentEnd?(action: AgentFinish, verbose?: boolean): Promise<void>;
}

export abstract class BaseCallbackManager extends BaseCallbackHandler {
  abstract addHandler(handler: BaseCallbackHandler): void;

  abstract removeHandler(handler: BaseCallbackHandler): void;

  abstract setHandlers(handlers: BaseCallbackHandler[]): void;

  setHandler(handler: BaseCallbackHandler): void {
    return this.setHandlers([handler]);
  }
}

export class CallbackManager extends BaseCallbackManager {
  handlers: BaseCallbackHandler[];

  constructor() {
    super();
    this.handlers = [];
  }

  async handleLLMStart(
    llm: { name: string },
    prompts: string[],
    verbose?: boolean
  ): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreLLM && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleLLMStart?.(llm, prompts);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`
          );
        }
      }
    }
  }

  async handleLLMNewToken(token: string, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreLLM && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleLLMNewToken?.(token);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`
          );
        }
      }
    }
  }

  async handleLLMError(err: Error, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreLLM && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleLLMError?.(err);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleLLMError: ${err}`
          );
        }
      }
    }
  }

  async handleLLMEnd(output: LLMResult, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreLLM && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleLLMEnd?.(output);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`
          );
        }
      }
    }
  }

  async handleChainStart(
    chain: { name: string },
    inputs: ChainValues,
    verbose?: boolean
  ): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreChain && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleChainStart?.(chain, inputs);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleChainStart: ${err}`
          );
        }
      }
    }
  }

  async handleChainError(err: Error, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreChain && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleChainError?.(err);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleChainError: ${err}`
          );
        }
      }
    }
  }

  async handleChainEnd(output: ChainValues, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreChain && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleChainEnd?.(output);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`
          );
        }
      }
    }
  }

  async handleToolStart(
    tool: { name: string },
    input: string,
    verbose?: boolean
  ): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreAgent && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleToolStart?.(tool, input);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleToolStart: ${err}`
          );
        }
      }
    }
  }

  async handleToolError(err: Error, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreAgent && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleToolError?.(err);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleToolError: ${err}`
          );
        }
      }
    }
  }

  async handleToolEnd(output: string, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreAgent && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleToolEnd?.(output);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`
          );
        }
      }
    }
  }

  async handleText(text: string, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (verbose || handler.alwaysVerbose) {
        try {
          await handler.handleText?.(text);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleText: ${err}`
          );
        }
      }
    }
  }

  async handleAgentAction(
    action: AgentAction,
    verbose?: boolean
  ): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreAgent && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleAgentAction?.(action);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`
          );
        }
      }
    }
  }

  async handleAgentEnd(action: AgentFinish, verbose?: boolean): Promise<void> {
    for (const handler of this.handlers) {
      if (!handler.ignoreAgent && (verbose || handler.alwaysVerbose)) {
        try {
          await handler.handleAgentEnd?.(action);
        } catch (err) {
          console.error(
            `Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`
          );
        }
      }
    }
  }

  addHandler(handler: BaseCallbackHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: BaseCallbackHandler): void {
    this.handlers = this.handlers.filter((_handler) => _handler !== handler);
  }

  setHandlers(handlers: BaseCallbackHandler[]): void {
    this.handlers = handlers;
  }
}

export class ConsoleCallbackHandler extends BaseCallbackHandler {
  async handleChainStart(
    chain: { name: string },
    _inputs: ChainValues,
    _verbose?: boolean
  ): Promise<void> {
    console.log(`Entering new ${chain.name} chain...`);
  }

  async handleChainEnd(
    _output: ChainValues,
    _verbose?: boolean
  ): Promise<void> {
    console.log("Finished chain.");
  }

  async handleAgentAction(
    action: AgentAction,
    _verbose?: boolean
  ): Promise<void> {
    console.log(action.log);
  }

  async handleToolEnd(output: string, _verbose?: boolean): Promise<void> {
    console.log(output);
  }

  async handleText(text: string, _verbose?: boolean): Promise<void> {
    console.log(text);
  }

  async handleAgentEnd(action: AgentFinish, _verbose?: boolean): Promise<void> {
    console.log(action.log);
  }
}