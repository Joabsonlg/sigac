import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreditCard, ArrowLeft } from "lucide-react";
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
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { isValidCpf, formatCpf, cleanCpf } from "@/utils/cpfValidator";
import { AuthService } from "@/services/authService";

const resetPasswordSchema = z.object({
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .refine(isValidCpf, "CPF inválido"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      cpf: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Call the real API endpoint for password reset by CPF
      const cleanedCpf = cleanCpf(values.cpf);
      
      console.log("Password reset requested for CPF:", cleanedCpf);
      
      // Use the new CPF-based password reset method
      await AuthService.requestPasswordResetByCpf(cleanedCpf);
      
      toast.success("Instruções de recuperação enviadas! Verifique seu email.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao solicitar recuperação de senha.");
      console.error("Password reset error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCpf(value);
    return formatted;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SIGAC - Recuperar senha</CardTitle>
          <CardDescription>
            Digite seu CPF para receber instruções de recuperação por email
          </CardDescription>
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
                          value={field.value}
                          onChange={(e) => {
                            const formatted = handleCpfChange(e.target.value);
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
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar instruções"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link 
            to="/login" 
            className="text-sm text-primary flex items-center hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
