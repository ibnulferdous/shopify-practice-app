import { TitleBar } from "@shopify/app-bridge-react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";

export default function CustomersPage() {
  return (
    <Page>
      <TitleBar title="Customers" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="heading2xl" as="h1">
                Customers page
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
