'use client';

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/src/lib/auth";
export default function Login() {
	const router = useRouter();
	const [input1, onChangeInput1] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [rememberMe, setRememberMe] = useState(true);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [helpTopic, setHelpTopic] = useState<"help" | "reset" | "register" | null>(null);
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setSubmitting(true);
		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: input1, password }),
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok || typeof result.token !== 'string') {
				throw new Error(result.error || 'Tidak dapat masuk. Periksa email dan kata sandi.');
			}
			window.localStorage.removeItem(AUTH_TOKEN_KEY);
			window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
			(rememberMe ? window.localStorage : window.sessionStorage).setItem(AUTH_TOKEN_KEY, result.token);
			router.replace('/Dashboard');
		} catch (submitError) {
			setError(submitError instanceof TypeError
				? 'Layanan admin tidak dapat dihubungi. Pastikan backend dan database MySQL sedang berjalan.'
				: submitError instanceof Error ? submitError.message : 'Backend tidak dapat dihubungi.');
		} finally {
			setSubmitting(false);
		}
	};
	return (
		<div className="page-shell flex flex-col bg-white">
			<div className="page-canvas page-login-canvas self-stretch bg-slate-50 pt-[54px] px-4 lg:px-40 overflow-hidden">
				<div className="login-header flex items-center self-stretch mb-[52px]">
					<div className="flex flex-1 justify-between items-center">
						<div className="flex shrink-0 items-center gap-2.5">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/h75en120_expires_30_days.png"} 
								className="w-[38px] h-[38px] rounded-xl object-fill"
							/>
							<div className="flex flex-col shrink-0 items-start gap-[1px]">
								<span className="text-[#17253A] text-[17px] font-bold" >
									Pasar Splendid
								</span>
								<span className="text-[#69788B] text-[10px] mr-[15px]" >
									MALANG • SEJAK 1960
								</span>
							</div>
						</div>
						<span className="text-[#69788B] text-[13px]" >
							Pasar lokal. Cerita yang menghubungkan.
						</span>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<a href="https://www.google.com/maps/search/?api=1&query=Pasar+Splendid+Malang" target="_blank" rel="noreferrer" className="flex shrink-0 items-center bg-white text-left py-2 px-3 gap-2 rounded-lg border border-solid border-[#E6EBF0]">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/w98947py_expires_30_days.png"} 
								className="w-3.5 h-3.5 rounded-lg object-fill"
							/>
							<span className="text-[#17253A] text-xs font-bold" >
								Kembali ke pasar
							</span>
						</a>
						<button className="flex shrink-0 items-center bg-white text-left py-2 px-3 gap-2 rounded-lg border border-solid border-[#E6EBF0]"
							type="button" onClick={() => setHelpTopic("help")}>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/p6rbi0cs_expires_30_days.png"} 
								className="w-3.5 h-3.5 rounded-lg object-fill"
							/>
							<span className="text-[#17253A] text-xs font-bold" >
								Bantuan
							</span>
						</button>
					</div>
				</div>
				<div className="login-card flex items-center self-stretch bg-white mb-[52px] rounded-2xl" 
					style={{
						boxShadow: "0px 8px 28px #0B132B17"
					}}>
					<div className="login-hero flex flex-1 flex-col items-start py-11 pr-0 lg:pr-11" 
						style={{
							background: "linear-gradient(180deg, #0B132B24, #0B132B14, #0B132BED)"
						}}>
						<a href="https://www.google.com/maps/search/?api=1&query=Pasar+Splendid+Malang" target="_blank" rel="noreferrer" className="flex items-center bg-[#FFFFFFE6] text-left py-2 px-[13px] mb-4 lg:mb-[347px] ml-0 lg:ml-11 gap-[7px] rounded-[100px] border-0">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/ljbxogqz_expires_30_days.png"} 
								className="w-3.5 h-3.5 rounded-[100px] object-fill"
							/>
							<span className="text-[#17253A] text-[11px] font-bold" >
								MALANG, JAWA TIMUR
							</span>
						</a>
						<div className="flex flex-col items-start self-stretch ml-0 lg:ml-11 gap-5">
							<span className="text-white text-[40px] font-bold w-full max-w-[403px] lg:w-[403px]" >
								Temukan inspirasi dan jalin koneksi.
							</span>
							<span className="text-[#E2EAE6] text-[15px] w-full max-w-[427px] lg:w-[427px]" >
								Jelajahi kekayaan Pasar Splendid, temui pedagang lokal, dan berbagi cerita bersama komunitas.
							</span>
							<div className="flex items-center self-stretch gap-3">
								<div className="flex flex-col shrink-0 items-start bg-[#FFFFFF1A] text-left p-2.5 rounded-lg border-0">
									<span className="text-white text-xl font-bold" >
										340+
									</span>
								</div>
								<span className="text-[#E2EAE6] text-xs w-[143px]" >
									Anggota berbagi inspirasi setiap hari.
								</span>
							</div>
						</div>
					</div>
					<div className="login-panel flex flex-1 flex-col items-start pt-[52px]">
						<div className="flex items-center mb-6 ml-0 lg:ml-14 gap-2.5">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/y8akho88_expires_30_days.png"} 
								className="w-[38px] h-[38px] rounded-xl object-fill"
							/>
							<div className="flex flex-col shrink-0 items-start gap-[1px]">
								<span className="text-[#17253A] text-[17px] font-bold" >
									Pasar Splendid
								</span>
								<span className="text-[#69788B] text-[10px] mr-[15px]" >
									MALANG • SEJAK 1960
								</span>
							</div>
						</div>
						<div className="flex flex-col items-center self-stretch mb-6">
							<div className="flex flex-col items-start pr-[21px] gap-2">
								<span className="text-[#17253A] text-3xl font-bold" >
									Selamat datang kembali
								</span>
								<span className="text-[#69788B] text-sm w-full max-w-[427px] lg:w-[427px]" >
									Masuk untuk menjelajahi pasar dan terhubung dengan komunitas Splendid.
								</span>
							</div>
						</div>
						<form className="contents" onSubmit={handleSubmit}>
						<div className="flex flex-col items-center self-stretch mb-6">
							<div className="flex flex-col w-full max-w-[448px] lg:w-[448px] gap-5">
								<div className="flex flex-col items-start self-stretch gap-2">
									<span className="text-[#17253A] text-xs font-bold" >
										Email
									</span>
									<div className="flex items-center self-stretch bg-white rounded-lg border border-solid border-[#E6EBF0]">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/52btpt3n_expires_30_days.png"} 
											className="w-[17px] h-[17px] ml-3.5 mr-2.5 rounded-lg object-fill"
										/>
										<input
										type="email"
										name="email"
										autoComplete="username"
										required
										placeholder="aulia.putri@email.com"
											value={input1}
											onChange={(event)=>onChangeInput1(event.target.value)}
											className="flex-1 self-stretch text-[#69788B] bg-transparent text-[13px] py-[13px] mr-1 border-0"
										/>
									</div>
								</div>
								<div className="flex flex-col items-start self-stretch gap-2">
									<span className="text-[#17253A] text-xs font-bold" >
										Kata sandi
									</span>
									<div className="flex items-center self-stretch bg-white py-3 px-3.5 rounded-lg border border-solid border-[#E6EBF0]">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/v5ch58kl_expires_30_days.png"} 
											className="w-[17px] h-[17px] mr-2.5 rounded-lg object-fill"
										/>
													<input
														type={passwordVisible ? "text" : "password"}
											name="password"
											autoComplete="current-password"
											required
													placeholder="Masukkan kata sandi"
											value={password}
											onChange={(event)=>setPassword(event.target.value)}
											className="flex-1 min-w-0 text-[#69788B] bg-transparent text-sm border-0 outline-none"
										/>
										<button type="button" aria-label={passwordVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={passwordVisible} onClick={() => setPasswordVisible((visible) => !visible)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/8c7bqd0f_expires_30_days.png"}
												className="h-[17px] w-[17px] rounded-lg object-fill"
											/>
										</button>
									</div>
								</div>
								<div className="flex justify-between items-center self-stretch">
									<label className="flex shrink-0 cursor-pointer items-center gap-2 text-[#17253A] text-xs">
										<input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="size-4 accent-emerald-600" />
										Ingat saya
									</label>
									<button type="button" onClick={() => setHelpTopic("reset")} className="text-[#007D50] text-xs font-bold hover:underline">
										Lupa kata sandi?
									</button>
								</div>
							</div>
						</div>
						<div className="flex flex-col items-center self-stretch mb-6">
							<button type="submit" disabled={submitting} className="flex items-center bg-[#00A86B] text-left py-[15px] px-4 lg:px-[187px] gap-3 rounded-lg border-0 disabled:opacity-70">
								<span className="text-white text-sm font-bold" >
									{submitting ? 'Memeriksa…' : 'Masuk'}
								</span>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/k6y6wh11_expires_30_days.png"} 
									className="w-[18px] h-[18px] rounded-lg object-fill"
								/>
							</button>
						</div>
						{error && <p role="alert" className="mb-6 text-center text-sm text-red-600">{error}</p>}
						</form>
						<div className="flex flex-col items-center self-stretch mb-6">
							<div className="flex items-center px-4 lg:px-[119px] gap-2">
								<span className="text-[#69788B] text-xs" >
									Belum punya akun?
								</span>
								<button type="button" onClick={() => setHelpTopic("register")} className="text-[#007D50] text-xs font-bold hover:underline">
									Daftar sekarang
								</button>
							</div>
						</div>
						<div className="flex flex-col items-center self-stretch mb-[103px]">
							<div className="flex items-center py-1.5 gap-2">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0fUDfART7Y/3qhd1xnk_expires_30_days.png"} 
									className="w-[17px] h-[17px] object-fill"
								/>
								<span className="text-[#69788B] text-[11px]" >
									Data Anda aman. Bersama membangun pasar yang lebih terhubung.
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-between items-center self-stretch mb-12">
					<span className="text-[#69788B] text-[11px]" >
						© 2026 Pasar Splendid Malang
					</span>
					<span className="text-[#69788B] text-[11px]" >
						Kebijakan Privasi    •    Syarat &amp; Ketentuan
					</span>
				</div>
				{helpTopic && (
					<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpTopic(null); }}>
						<section role="dialog" aria-modal="true" aria-labelledby="login-help-title" className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
							<div className="flex items-start justify-between gap-4">
								<h2 id="login-help-title" className="text-lg font-bold">
									{helpTopic === "reset" ? "Lupa kata sandi?" : helpTopic === "register" ? "Pendaftaran admin" : "Bantuan masuk"}
								</h2>
								<button type="button" aria-label="Tutup" onClick={() => setHelpTopic(null)} className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
							</div>
							<p className="mt-3 text-sm leading-6 text-slate-600">
								{helpTopic === "reset"
									? "Hubungi administrator utama untuk mendapatkan bantuan reset kata sandi. Setelah berhasil masuk, Anda dapat mengganti kata sandi melalui halaman Pengaturan."
									: helpTopic === "register"
										? "Pendaftaran publik dinonaktifkan demi keamanan. Admin yang sudah masuk dapat membuat akun admin baru melalui halaman Pengaturan."
										: "Masuk menggunakan email dan kata sandi admin yang sudah diberikan. Jika sesi berakhir atau kredensial tidak dikenali, hubungi administrator utama."
								}
							</p>
							<button type="button" onClick={() => setHelpTopic(null)} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">Mengerti</button>
						</section>
					</div>
				)}
			</div>
		</div>
	)
}



