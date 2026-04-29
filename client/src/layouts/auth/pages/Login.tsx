import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { MyInput } from "@/shared/components/atoms/form/MyInput";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { useUserStore } from "@/shared/store/useUserStore";
import request from "@/request";

const schema = z.object({
  email: z.string().email("Noto'g'ri email"),
  password: z.string().min(1, "Parol kiritilmadi"),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useUserStore((s) => s.setUser);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await request.post("/auth/login", data);
      setTokens(res.data.data.accessToken, res.data.data.refreshToken);
      setUser(res.data.data.user);
      navigate("/dashboard");
    } catch {
      toast.error("Email yoki parol noto'g'ri");
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await request.post("/auth/google", { credential: response.access_token });
        setTokens(res.data.data.accessToken, res.data.data.refreshToken);
        setUser(res.data.data.user);
        navigate("/dashboard");
      } catch {
        toast.error("Google orqali kirish muvaffaqiyatsiz");
      }
    },
    onError: () => toast.error("Google orqali kirish muvaffaqiyatsiz"),
  });

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Kirish..." : "Kirish"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-slate-600">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-xs">yoki</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <button
        onClick={() => googleLogin()}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 py-3.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.8-1.9 13.4-5l-6.2-5.2C29.3 35.6 26.7 36.5 24 36.5c-5.2 0-9.6-3.3-11.3-8l-6.5 5c3.3 6.7 10.2 11 17.8 11z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.2 5.5l.1-.1 6.2 5.2c-.4.4 6.6-4.8 6.6-14.6 0-1.3-.1-2.7-.4-3.9z" />
        </svg>
        Google bilan kirish
      </button>

      <p className="text-center text-sm text-slate-500">
        Akkaunt yo'qmi?{" "}
        <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
          Ro'yxatdan o'tish
        </Link>
      </p>
    </div>
  );
}
