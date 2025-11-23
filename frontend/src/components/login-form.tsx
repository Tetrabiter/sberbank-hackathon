import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Войдите в свой аккаунт</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Введите вашу электронную почту, чтобы войти в аккаунт
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Электронная почта</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Забыли пароль?
            </a>
          </div>
          <Input id="password" type="password" required />
        </Field>
        <Field>
          <Link to={"/onboarding"}>
            <Button className="w-full" type="submit">Войти</Button>
          </Link>
        </Field>
        <FieldSeparator>Или продолжить с</FieldSeparator>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Зарегистрироваться
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
