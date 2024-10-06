import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import "../login.css"

const MatrixRain = () => {
    useEffect(() => {
        const canvas = document.getElementById('matrix-rain') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}|:<>?'
        const charArray = chars.split('')
        const fontSize = 14
        const columns = canvas.width / fontSize

        const drops: number[] = []
        for (let i = 0; i < columns; i++) {
            drops[i] = 1
        }

        const draw = () => {
            if (!ctx) return
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.fillStyle = '#0F0'
            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                const text = charArray[Math.floor(Math.random() * charArray.length)]
                ctx.fillText(text, i * fontSize, drops[i] * fontSize)

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0
                }

                drops[i]++
            }
        }

        const interval = setInterval(draw, 33)

        return () => clearInterval(interval)
    }, [])

    return <canvas id="matrix-rain" className="fixed top-0 left-0 w-full h-full z-0" />
}

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle login logic here
        console.log('Login attempted with:', { username, password })
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center relative overflow-hidden">
            <MatrixRain />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 opacity-50"></div>
            <div className="z-10 w-full max-w-md p-8 bg-gray-800 bg-opacity-80 rounded-lg border border-purple-500 shadow-lg shadow-purple-500/20">
                <h1 className="text-4xl font-bold mb-6 text-center glitch" data-text="CyberNexus">CyberNexus</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full py-2 pl-10 pr-3 bg-gray-700 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 placeholder-gray-400"
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full py-2 pl-10 pr-10 bg-gray-700 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 placeholder-gray-400"
                            placeholder="Enter password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg shadow-purple-500/50"
                    >
                        INITIATE LOGIN SEQUENCE
                    </button>
                </form>
            </div>
        </div>
    )
}