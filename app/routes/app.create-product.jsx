import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Box,
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
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

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
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: title,
          status: status,
        },
      },
    },
  );

  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: price }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    status: "ACTIVE",
  });

  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

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
          <BlockStack gap={400}>
            {/* Create Product Form */}

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
                      onChange={(value) =>
                        handleFormInputChange("title", value)
                      }
                      autoComplete="off"
                      required
                    />
                    <TextField
                      label="Price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={(value) =>
                        handleFormInputChange("price", value)
                      }
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
                      onChange={(value) =>
                        handleFormInputChange("status", value)
                      }
                    />
                    {/* Hidden input to capture status value for form submission */}
                    <input
                      type="hidden"
                      name="status"
                      value={formData.status}
                    />
                    <Button submit loading={isLoading}>
                      Create Product
                    </Button>
                  </BlockStack>
                </fetcher.Form>
              </BlockStack>
            </Card>

            {/* Show product after created */}
            {fetcher.data?.product && (
              <Card>
                <BlockStack gap={300}>
                  <Text as="h3" variant="headingMd">
                    Product Created!
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Title: {fetcher.data.product.title}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Price: ${fetcher.data.variant[0].price}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Status: {fetcher.data.product.status}
                  </Text>
                  <InlineStack gap="300">
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* Show JSON response */}
            {fetcher.data?.product && (
              <>
                <Card>
                  <BlockStack gap={300}>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productCreate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>

                    <Text as="h3" variant="headingMd">
                      {" "}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </BlockStack>
                </Card>
              </>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
