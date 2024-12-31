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
  TextField,
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
  const [personName, setPersonName] = useState(() => {
    const savedName = localStorage.getItem('personName');
    return savedName ? JSON.parse(savedName) : '';
  });
    const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string>();

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data: response } = await client.models.RandomActOfKindness.list(
        {}
      );
      const suggestions = response?.map(
        (item) => item.randomActOfKindnessSuggestion
      ) as string[];
      setUsedSuggestions(suggestions);
    };

    const fetchImage = async () => {
      const { data: image, errors } = await client.queries.generateImage({
        prompt:
          "Create a sunny floral image that evokes feelings of kindness and joy",
      });
      if (errors && errors?.length) {
        console.log({ errors });
      }
      setImage(image as unknown as string);
    };
    fetchImage();
    fetchSuggestions();
  }, []);

  const generateRandomActOfKindness = async () => {
    setLoading(true);
    console.log({personName});
    const { data: response } =
      await client.generations.generateRandomActOfKindness({
        personName,
        usedSuggestions,
      });
    const randomActOfKindnessSuggestion =
      response?.randomActOfKindnessSuggestion as string;
    await client.models.RandomActOfKindness.create({
      randomActOfKindnessSuggestion,
    });
    setUsedSuggestions([...usedSuggestions, randomActOfKindnessSuggestion]);
    setSuggestion(randomActOfKindnessSuggestion);
    setLoading(false);
  };

  const handleSetPersonName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPersonName(event.target.value);
    localStorage.setItem('personName', JSON.stringify(event.target.value));
  }

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
            Random Acts Of Kindness
          </Heading>
        </Card>
        <Card
          textAlign={"center"}
          margin={tokens.space.small}
          borderRadius={tokens.radii.medium}
        >
          <Flex direction="column" gap={tokens.space.small}>
            <TextField
              label={
                <Text fontSize={tokens.fontSizes.medium} color={"burlywood"}>
                  Who would you like to generate an act of kindness for?
                </Text>
              }
              style={{
                color: "burlywood",
              }}
              placeholder="Enter a name"
              value={personName}
              onChange={handleSetPersonName}
              size="large"
            />
          </Flex>
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
              onClick={() => generateRandomActOfKindness()}
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
          onClick={() => generateRandomActOfKindness()}
          borderRadius={tokens.radii.medium}
        >
          <Text fontSize={tokens.fontSizes.medium} color={"burlywood"}>
            Generate a Random Act Of Kindness
          </Text>
        </Card>
      </Flex>
    </ThemeProvider>
  );
}

export default App;
