import { TitleBar } from "@shopify/app-bridge-react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // const response = await admin.graphql(
  //   `#graphql
  // mutation CreateSummerDiscount($input: DiscountCodeBasicInput!) {
  //   discountCodeBasicCreate(basicCodeDiscount: $input) {
  //     codeDiscountNode {
  //       id
  //       codeDiscount {
  //         ... on DiscountCodeBasic {
  //           title
  //           codes(first: 10) {
  //             nodes {
  //               code
  //             }
  //           }
  //           startsAt
  //           endsAt
  //         }
  //       }
  //     }
  //     userErrors {
  //       field
  //       message
  //     }
  //   }
  // }`,
  //   {
  //     variables: {
  //       input: {
  //         title: "Limited time discount off all items",
  //         code: "BUYNOW20",
  //         startsAt: "2025-08-05T00:00:00Z",
  //         endsAt: "2026-09-21T00:00:00Z",
  //         customerSelection: {
  //           all: true,
  //         },
  //         customerGets: {
  //           value: {
  //             percentage: 0.2,
  //           },
  //           items: {
  //             all: true,
  //           },
  //         },
  //         appliesOncePerCustomer: true,
  //       },
  //     },
  //   },
  // );

  // const data = await response.json();
  console.log("Data Received by the action function");

  return json({ data: "Form submitted" });
};

export default function DiscountsPage() {
  const { discount } = useActionData();
  console.log(discount);

  return (
    <Page>
      <TitleBar title="Discounts" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap={300}>
              <Text as="h2" variant="heading2xl">
                Discounts
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
