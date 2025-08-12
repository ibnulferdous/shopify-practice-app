import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Button,
  Card,
  ChoiceList,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useActionData, useFetcher } from "@remix-run/react";
import { useState } from "react";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Get form data from the request
  const formData = await request.formData();
  const title = formData.get("title");
  const price = formData.get("price");
  const status = formData.get("status");

  // Here you would typically create the product with the title
  // For now, just return the title to show in the UI

  console.log("Title: ", title);
  console.log("Price: ", price);
  console.log("Status: ", status);

  return { title, price, status };
};

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    status: "ACTIVE",
  });

  const fetcher = useFetcher();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const handleFormInputChange = (field, value) => {
    if (field === "status") {
      setFormData({
        ...formData,
        [field]: value[0],
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  return (
    <Page>
      <TitleBar title="Store Products" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap={400}>
              <Text as="h2" variant="heading2xl">
                Create a new product
              </Text>
              <Text as="p" variant="bodyMd">
                Loading state: {isLoading ? "True" : "False"}
              </Text>

              {/* Add the fetcher.Form here */}
              <fetcher.Form method="post">
                <BlockStack gap="300">
                  <TextField
                    label="Product Title"
                    name="title"
                    value={formData.title}
                    onChange={(value) => handleFormInputChange("title", value)}
                    autoComplete="off"
                    required
                  />
                  <TextField
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={(value) => handleFormInputChange("price", value)}
                    autoComplete="off"
                    required
                  />
                  <ChoiceList
                    title="Status"
                    choices={[
                      { label: "Active", value: "ACTIVE" },
                      { label: "Archived", value: "ARCHIVED" },
                      { label: "Draft", value: "DRAFT" },
                    ]}
                    selected={formData.status}
                    onChange={(value) => handleFormInputChange("status", value)}
                  />
                  {/* Hidden input to capture status value for form submission */}
                  <input type="hidden" name="status" value={formData.status} />
                  <Button submit loading={isLoading}>
                    Create Product
                  </Button>
                </BlockStack>
              </fetcher.Form>

              {fetcher.data?.title && (
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Product Created!
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Title: {fetcher.data.title}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Price: {fetcher.data.price}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Status: {fetcher.data.status}
                  </Text>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
