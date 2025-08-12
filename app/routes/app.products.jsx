import { TitleBar } from "@shopify/app-bridge-react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query GetProducts {
      products(first: 50) {
        nodes {
          id
          title
          description
          createdAt
          updatedAt
          status
          handle
        }
      }
    }`,
  );

  const { data } = await response.json();
  const products = data.products.nodes;

  return products;
};

export default function ProductsPage() {
  const productData = useLoaderData();

  return (
    <Page>
      <TitleBar title="Products" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap={300}>
              <Text variant="heading2xl" as="h2">
                First {productData.length} products:
              </Text>
              {productData.map((product) => (
                <>
                  <Text key={product.id} variant="headingXl" as="h4">
                    {product.title}
                  </Text>
                  {productData.description && (
                    <Text variant="bodyMd">
                      Description: {product.description}
                    </Text>
                  )}
                  <Text variant="bodyMd">Created at: {product.createdAt}</Text>
                  <Text variant="bodyMd">Updated at: {product.updatedAt}</Text>
                  <Text variant="bodyMd">Status: {product.status}</Text>
                  <Text variant="bodyMd">Handle: {product.handle}</Text>
                </>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
