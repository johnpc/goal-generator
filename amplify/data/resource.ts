import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { generateImage } from "../functions/generateImage/resource";

const goalTypes = `
Investing time in various aspects of your life is crucial for overall well-being and personal growth. Here are some key areas to consider:

Professional development: Career, skills, networking, and continuous learning.

Personal relationships: Family, friends, romantic partnerships, and social connections.

Health and wellness: Physical fitness, nutrition, mental health, and self-care.

Financial management: Budgeting, saving, investing, and long-term financial planning.

Personal growth and self-improvement: Developing new skills, pursuing hobbies, and exploring interests.

Spiritual or philosophical growth: Exploring beliefs, values, and purpose in life.

Emotional intelligence: Understanding and managing your emotions and relationships.

Community involvement: Volunteering, social causes, and giving back to society.

Creativity and self-expression: Artistic pursuits, writing, or other creative outlets.

Time management and productivity: Organizing your life and improving efficiency.

Cultural awareness and diversity: Expanding your understanding of different cultures and perspectives.

Environmental consciousness: Sustainable living and environmental stewardship.

Rest and relaxation: Ensuring adequate downtime and stress management.

Personal space and environment: Creating a comfortable and organized living space.
`;
const schema = a.schema({
  DailyGoal: a
    .model({
      dailyGoalSuggestion: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
  generateDailyGoal: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet v2"),
      systemPrompt:
        "You are a helpful assistant that generates daily goals. " +
        "Suggest an act that the user can do today to advance their goals. " +
        `Goal types can be ${goalTypes}` +
        "You never reuse suggestions. " +
        "The act should be one or two or three sentences long, and acheivable within a day",
      inferenceConfiguration: {
        temperature: 0.7,
        topP: 1,
        maxTokens: 400,
      },
    })
    .arguments({
      goalType: a.string().required(),
      usedSuggestions: a.string().array().required(),
    })
    .returns(
      a.customType({
        dailyGoalSuggestion: a.string(),
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
