
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LogIn, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isValidCpf, formatCpf, cleanCpf } from "@/utils/cpfValidator";

const loginFormSchema = z.object({
  cpf: z.string()
    .min(1, { message: "CPF é obrigatório" })
    .refine((cpf) => isValidCpf(cpf), { message: "CPF inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      cpf: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      // Clean CPF for API call
      const cleanedCpf = cleanCpf(values.cpf);
      
      // Use the AuthContext login method which handles API integration
      await login({
        cpf: cleanedCpf,
        password: values.password,
      });
      
      // Navigate on successful login (handled by AuthContext)
      navigate("/");
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SIGAC</CardTitle>
          <CardDescription>Entre com sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="000.000.000-00" 
                          className="pl-10" 
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCpf(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={14}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="absolute right-0 top-0" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Esconder senha" : "Mostrar senha"}
                          </span>
                        </Button>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="******" 
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <Link to="/recuperar-senha" className="text-primary hover:underline text-sm">
                  Esqueceu sua senha?
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
