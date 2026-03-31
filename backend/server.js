import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// -------- SIGNUP --------
app.post('/signup', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
  })

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'User created!', user: data.user })
})

// -------- LOGIN --------
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Logged in!', session: data.session })
})

// -------- GET CURRENT USER --------
// frontend sends access_token in Authorization header
app.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error) return res.status(401).json({ error: error.message })
  res.json({ user: data.user })
})

// -------- LOGOUT --------
// optional: frontend can just delete token
app.post('/logout', (req, res) => {
  // backend doesn’t need to do much, tokens expire
  res.json({ message: 'Logged out!' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))