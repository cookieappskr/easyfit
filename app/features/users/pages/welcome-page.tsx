import { Resend } from "resend";
import type { Route } from "./+types/welcome-page";
import WelcomeUser from "react-email-starter/emails/welcome-user";

const client = new Resend(process.env.RESEND_API_KEY);

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { data, error } = await client.emails.send({
    from: "Eddie <help@mail.cookieapps.kr>",
    to: ["cowboy0626@naver.com"],
    subject: "가입을 환영합니다.",
    react: <WelcomeUser username={params?.username || "고객"} />,
  });
  return Response.json({ data, error });
};
