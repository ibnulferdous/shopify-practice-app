import { TitleBar } from "@shopify/app-bridge-react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query inventoryItems {
      inventoryItems(first: 50) {
        edges {
          node {
            id
            tracked
            sku
            countryCodeOfOrigin
            createdAt
            updatedAt
            variant {
                displayName
                id
                product {
                    id
                    title
                    handle
                    onlineStoreUrl
                }
            }
          }
        }
      }
    }`,
  );

  const { data } = await response.json();
  const indentoryData = data.inventoryItems.edges;

  return indentoryData;
};

export default function InventoryPage() {
  const data = useLoaderData();

  return (
    <Page>
      <TitleBar title="Inventory" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap={300}>
              <Text as="h2" variant="heading2xl">
                First {data.length} inventory:
              </Text>

              {data.map((item) => (
                <div key={item.node.id}>
                  <Text as="h3" variant="headingMd">
                    Product Title: {item.node.variant.product.title}
                  </Text>
                  <Text as="h3" variant="headingMd">
                    Variant Name: {item.node.variant.displayName}
                  </Text>
                  {item.node.sku && (
                    <Text as="p" variant="bodyMd">
                      SKU: {item.node.sku}
                    </Text>
                  )}
                  <Text as="p" variant="bodyMd">
                    Created at: {item.node.createdAt}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Updated at: {item.node.updatedAt}
                  </Text>
                </div>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
