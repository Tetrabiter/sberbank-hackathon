import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Создайте аккаунт</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Заполните форму ниже, чтобы создать свой аккаунт{" "}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Имя</FieldLabel>
          <Input id="name" type="text" placeholder="Иван Иванов" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Электронная почта</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
          <FieldDescription>
            Мы будем использовать это для связи с вами. Мы не передадим вашу
            почту третьим лицам.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <Input id="password" type="password" required />
          <FieldDescription>Должно быть не менее 8 символов</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Подтвердите пароль</FieldLabel>
          <Input id="confirm-password" type="password" required />
          <FieldDescription>Пожалуйста, подтвердите пароль</FieldDescription>
        </Field>
        <Field>
          <Link to={"/onboarding"}>
            <Button className="w-full" type="submit">Создать аккаунт</Button>
          </Link>
        </Field>
        <FieldSeparator>Продолжить с</FieldSeparator>
        <Field>
          <FieldDescription className="px-6 w-full text-center">
            Уже есть аккаунт? <Link to="/signin">Войти</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
