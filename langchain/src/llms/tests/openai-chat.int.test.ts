import { test, expect } from "@jest/globals";
import { OpenAIChat } from "../openai-chat.js";

test("Test OpenAI", async () => {
  const model = new OpenAIChat({ modelName: "gpt-3.5-turbo" });
  const res = await model.call("Print hello world");
  console.log({ res });
});

test("Test OpenAI with prefix messages", async () => {
  const model = new OpenAIChat({
    prefixMessages: [
      { role: "user", content: "My name is John" },
      { role: "assistant", content: "Hi there" },
    ],
  });
  const res = await model.call("What is my name");
  console.log({ res });
});

test.only("Test OpenAI with prefix messages", async () => {
  const model = new OpenAIChat({
    prefixMessages: [
      {
        role: "system",
        content: `You are ChatGPT, a large language model (LLM) trained by OpenAI. Answer as concisely as possible. Knowledge cutoff: {knowledge_cutoff} Current date: {current_date}. Help the user to design an AI app using LLMs.`,
      },
      {
        role: "user",
        content:
          "What context should I give an LLM to write a good SQL query given a natural language question?",
      },
      {
        role: "assistant",
        content: `To design an AI app using LLMs to write SQL queries, you should give the following context:
    
1. The domain of the data you are working with (e.g., sales, customer data, financial data).
2. The schema of the database and the relevant tables and columns that can be used to answer the question.
3. Examples of natural language questions for which you want SQL queries generated.
4. The business logic or rules that should be applied to the results (e.g., filter, group, sort, aggregate).

With this context, the LLM can learn to understand natural language questions, generate SQL queries that retrieve data from the relevant tables, and apply the necessary business logic to provide the desired results.`,
      },
      {
        role: "user",
        content:
          "Can you write a prompt template that follows those guidelines? Use {placeholder_name} to indicate where input variables should be inserted. For example, {domain} could be replaced with sales, customer data, or financial data",
      },
      {
        role: "assistant",
        content: `Sure, here's a prompt template that follows the guidelines:

For an AI app that generates SQL queries given a natural language question:

    Context: 
    We are working with data in the {domain} domain. The database schema includes {table_names} tables, which have several relevant columns that can be used to answer questions.
    
    Examples:
    1. What is the total revenue for each product category this year?
    2. How many new customers signed up last month?
    3. Which products have sold more than 1,000 units in the last quarter?
    
    Rules:
    We want the results to be filtered by {filter_criteria}, grouped by {group_criteria}, sorted by {sort_criteria}, and/or aggregated by {aggregate_criteria} where applicable.
    
    Output:
    Provide an SQL query that retrieves the relevant data from the database and applies the necessary rules to provide the desired results.`,
      },
    ],
  });
  const res = await model.call(
    "What format can I use to pass in the table schemas?"
  );
  console.log(res);
});

test("Test OpenAI in streaming mode", async () => {
  let nrNewTokens = 0;
  let streamedCompletion = "";

  const model = new OpenAIChat({
    modelName: "gpt-3.5-turbo",
    streaming: true,
    callbackManager: {
      handleNewToken(token) {
        nrNewTokens += 1;
        streamedCompletion += token;
      },
    },
  });
  const res = await model.call("Print hello world");
  console.log({ res });

  expect(nrNewTokens > 0).toBe(true);
  expect(res).toBe(streamedCompletion);
});
