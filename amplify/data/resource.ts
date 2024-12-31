import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { generateImage } from "../functions/generateImage/resource";

const schema = a.schema({
  RandomActOfKindness: a
    .model({
      randomActOfKindnessSuggestion: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
  generateRandomActOfKindness: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet v2"),
      systemPrompt:
        "You are a helpful assistant that generates random acts of kindness. " +
        "Suggest an act that the user can do today to be kind to the person. " +
        "You never reuse suggestions. " +
        "The act should be one or two sentences long, and acheivable within a day",
      inferenceConfiguration: {
        temperature: 0.7,
        topP: 1,
        maxTokens: 400,
      },
    })
    .arguments({
      personName: a.string().required(),
      usedSuggestions: a.string().array().required(),
    })
    .returns(
      a.customType({
        randomActOfKindnessSuggestion: a.string(),
      })
    )
    .authorization((allow) => [allow.guest()]),
  generateImage: a
    .query()
    .arguments({
      prompt: a.string(),
    })
    .returns(a.string().array())
    .handler(a.handler.function(generateImage))
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
