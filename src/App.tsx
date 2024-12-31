import { useEffect, useState } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import config from "../amplify_outputs.json";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import {
  Loader,
  useTheme,
  defaultDarkModeOverride,
  ThemeProvider,
  Heading,
  Card,
  Text,
  Flex,
  SelectField,
} from "@aws-amplify/ui-react";
const client = generateClient<Schema>();

Amplify.configure(config);
const theme = {
  name: "my-theme",
  overrides: [defaultDarkModeOverride],
};

function App() {
  const { tokens } = useTheme();
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string>();
  const [goalType, setGoalType] = useState<string>('');

  // Interesting to think about: https://github.com/johnpc/goals/blob/master/goals/ViewController.swift#L20-L35
  const goalTypes = [
    "Professional development",
    "Personal relationships",
    "Health and wellness",
    "Financial management",
    "Personal growth and self-improvement",
    "Spiritual or philosophical growth",
    "Emotional intelligence",
    "Community involvement",
    "Creativity and self-expression",
    "Time management and productivity",
    "Cultural awareness and diversity",
    "Environmental consciousness",
    "Rest and relaxation",
    "Personal space and environment"
  ];
  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data: response } = await client.models.DailyGoal.list(
        {}
      );
      const suggestions = response?.map(
        (item) => item.dailyGoalSuggestion
      ) as string[];
      setUsedSuggestions(suggestions);
    };

    const fetchImage = async () => {
      const { data: image, errors } = await client.queries.generateImage({
        prompt:
          "Create an intense but beautiful image that evokes feelings of productivity",
      });
      if (errors && errors?.length) {
        console.log({ errors });
      }
      setImage(image as unknown as string);
    };
    fetchImage();
    fetchSuggestions();
  }, []);

  const generateGoal = async () => {
    setLoading(true);
    const { data: response } =
      await client.generations.generateDailyGoal({
        goalType,
        usedSuggestions,
      });
    const dailyGoalSuggestion =
      response?.dailyGoalSuggestion as string;
    await client.models.DailyGoal.create({
      dailyGoalSuggestion,
    });
    setUsedSuggestions([...usedSuggestions, dailyGoalSuggestion]);
    setSuggestion(dailyGoalSuggestion);
    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme} colorMode={"dark"}>
      <style>{`
        body {
          background-image: url('data:image/jpeg;base64,${image}') !important;
          margin: 0;
          padding: 0;
        }
      `}</style>
      <Flex direction="column" justifyContent="space-between" minHeight="100vh">
        <Card
          textAlign={"center"}
          margin={tokens.space.small}
          borderRadius={tokens.radii.medium}
        >
          <Heading color={"burlywood"} level={3}>
            Goal Generator
          </Heading>
        </Card>
        <Card
          textAlign="center"
          margin={tokens.space.small}
          borderRadius={tokens.radii.medium}
          padding={tokens.space.medium}
        >
          <SelectField
            label="Choose a Goal Type"
            labelHidden={false}
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
          >
            <option value="" disabled>Select a goal type</option>
            {goalTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>
        </Card>
        <Flex
          flex="1"
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          {!(loading || suggestion) ? (
            <></>
          ) : (
            <Card
              textAlign={"center"}
              margin={tokens.space.small}
              onClick={() => generateGoal()}
              borderRadius={tokens.radii.medium}
            >
              {loading ? (
                <Loader size="large" />
              ) : (
                <Text fontSize={tokens.fontSizes.xl} color={"chocolate"}>
                  {suggestion ?? "click to generate a suggestion"}
                </Text>
              )}
            </Card>
          )}
        </Flex>

        <Card
          textAlign={"center"}
          margin={tokens.space.small}
          onClick={() => generateGoal()}
          borderRadius={tokens.radii.medium}
        >
          <Text fontSize={tokens.fontSizes.medium} color={"burlywood"}>
            Generate a Goal
          </Text>
        </Card>
      </Flex>
    </ThemeProvider>
  );
}

export default App;
