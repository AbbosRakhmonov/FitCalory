import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MyInput } from "@/shared/components/atoms/form/MyInput";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { useUserStore } from "@/shared/store/useUserStore";
import request from "@/request";

const schema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta harf"),
  email: z.string().email("Noto'g'ri email"),
  password: z.string().min(8, "Parol kamida 8 ta belgi"),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useUserStore((s) => s.setUser);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await request.post("/auth/register", data);
      setTokens(res.data.data.accessToken, res.data.data.refreshToken);
      setUser(res.data.data.user);
      navigate("/profile?onboarding=true");
    } catch {
      toast.error("Bu email allaqachon ro'yxatdan o'tgan");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <MyInput
          label="Ism"
          placeholder="Ismingiz"
          error={errors.name?.message}
          {...register("name")}
        />
        <MyInput
          label="Email"
          type="email"
          placeholder="email@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <MyInput
          label="Parol"
          type="password"
          placeholder="Kamida 8 ta belgi"
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Akkaunt bor?{" "}
        <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
          Kirish
        </Link>
      </p>
    </div>
  );
}
