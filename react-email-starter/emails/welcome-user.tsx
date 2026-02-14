import {
  Body,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Row,
  Section,
  Img,
  Tailwind,
  Text,
  Container,
  Preview,
  Link,
} from "@react-email/components";

export default function WelcomeUser({ username }: { username: string }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Html>
          <Head />
          <Body>
            <Preview>{username}님, 가입을 환영합니다</Preview>
            <Container className="bg-white rounded-[8px] mx-auto max-w-[900px] overflow-hidden p-0">
              <Section>
                <Row className="bg-[rgb(41,37,36)] border-separate [border-spacing:24px] m-0 table-fixed w-full">
                  <Column className="pl-[12px]">
                    <Heading
                      as="h1"
                      className="text-white text-[28px] font-bold mb-[10px]"
                    >
                      {username}님, 가입을 환영합니다
                    </Heading>
                    <Text className="text-white/60 text-[14px] leading-[20px] m-0">
                      {username}님, 저희 서비스를 이용해 주셔서 감사합니다.
                    </Text>
                    <Link
                      href="#"
                      className="text-white/80 block text-[14px] leading-[20px] font-semibold mt-[12px] no-underline"
                    >
                      Shop now →
                    </Link>
                  </Column>
                  <Column className="w-[42%] h-[250px]">
                    <Img
                      src="https://react.email/static/coffee-bean-storage.jpg"
                      alt="Coffee Bean Storage"
                      className="rounded-[4px] h-full -mr-[6px] object-cover object-center w-full"
                    />
                  </Column>
                </Row>
              </Section>
              <Section className="mb-[24px]">
                <Row className="border-separate [border-spacing:12px] table-fixed w-full">
                  {[
                    {
                      imageUrl: "/static/atmos-vacuum-canister.jpg",
                      altText: "Auto-Sealing Vacuum Canister",
                      title: "Auto-Sealing Vacuum Canister",
                      description:
                        "A container that automatically creates an airtight seal with a button press.",
                      linkUrl: "#",
                    },
                    {
                      imageUrl:
                        "/static/vacuum-canister-clear-glass-bundle.jpg",
                      altText: "3-Pack Vacuum Containers",
                      title: "3-Pack Vacuum Containers",
                      description:
                        "Keep your coffee fresher for longer with this set of high-performance vacuum containers.",
                      linkUrl: "#",
                    },
                  ].map((product) => (
                    <Column
                      key={product.title}
                      className="mx-auto max-w-[180px]"
                    >
                      <Img
                        src={product.imageUrl}
                        alt={product.altText}
                        className="rounded-[4px] mb-[18px] w-full"
                      />
                      <div>
                        <Heading
                          as="h2"
                          className="text-[14px] leading-[20px] font-bold mb-[8px]"
                        >
                          {product.title}
                        </Heading>
                        <Text className="text-gray-500 text-[12px] leading-[20px] m-0 pr-[12px]">
                          {product.description}
                        </Text>
                      </div>
                    </Column>
                  ))}
                </Row>
              </Section>
            </Container>
          </Body>
        </Html>
      </Tailwind>
    </Html>
  );
}
