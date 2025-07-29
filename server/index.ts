import express, { type Request, type Response } from 'express'
import path from 'node:path'
import PocketBase from 'pocketbase'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
dotenv.config();
const __dirname = import.meta.dirname
const app = express()

app.use(cookieParser())

app.use('/public', express.static(path.join(__dirname, '/build/public')))

// Set cookie route
app.use('/api', express.json())
app.post('/api/cookie', async (req: Request, res: Response) => {
	const pb = new PocketBase(process.env.POCKETBASE_URL)
	try {
		const { token } = req.body

		if (!token) {
			return res.status(400).send('Auth token is missing')
		}

		pb.authStore.save(token)

		const authCookie = pb.authStore.exportToCookie({ sameSite: 'None' })

		res.setHeader('Set-Cookie', authCookie)
		res.status(200).json({})
	} catch (error) {
		res.status(500).send('Internal server error')
	}
})

//authentication and authorization
app.use(async (req: Request, res: Response, next) => {
	const pb = new PocketBase(process.env.POCKETBASE_URL)
	const cookie = req.headers.cookie

	if (!cookie) {
		return res.sendFile(path.join(__dirname, '/build/public/login.html'))
	}

	pb.authStore.loadFromCookie(cookie)

	try {
		await pb.collection('users').authRefresh()
		const groups = await pb
			.collection('groups')
			.getFirstListItem(`user_id="${pb.authStore.record.id}"`)
		if (groups[process.env.POCKETBASE_GROUP]) {
			return next()
		}
		return res.sendFile(path.join(__dirname, '/build/public/not_a_member.html'))
	} catch (error) {
		console.error(error)
		return res.sendFile(path.join(__dirname, '/build/public/login.html'))
	}
})

app.use(express.static(path.join(__dirname, '/build')))

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
