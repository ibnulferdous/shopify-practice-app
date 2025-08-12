import { TitleBar } from "@shopify/app-bridge-react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
  query {
    collections(first: 10) {
      edges {
        node {
          id
          title
          handle
          updatedAt
          sortOrder
        }
      }
    }
  }`,
  );

  const data = await response.json();
  const collectionsData = data.data.collections.edges;

  return collectionsData;
};

export default function CollectionsPage() {
  const collectionsData = useLoaderData();
  console.log(collectionsData);

  return (
    <Page>
      <TitleBar title="Collections" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="heading2xl" as="h2">
                First {collectionsData.length} collections:
              </Text>
              {collectionsData.map((collection) => (
                <Text key={collection.node.id} variant="headingxl" as="h3">
                  {collection.node.title}
                </Text>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
