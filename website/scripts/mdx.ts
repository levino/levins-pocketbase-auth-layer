import { promises as fs } from 'node:fs'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import matter from 'gray-matter'
import process from 'node:process'

// Get the input and output file paths from command-line arguments
const inputFile = process.argv[2]
const outputFile = process.argv[3] || inputFile.replace(/\.md$/, '.html')

// Ensure the input file is provided
if (!inputFile) {
	console.error('Usage: tsx md-to-html.ts <input.md> [output.html]')
	process.exit(1)
}
;(async () => {
	// Read the Markdown file
	const markdownContent = await fs.readFile(inputFile, 'utf8')

	// Parse frontmatter and Markdown content
	const { content, data } = matter(markdownContent)

	// Extract title and description from frontmatter
	const title = data.title || 'Untitled Document'
	const description = data.description || ''

	// Process the Markdown to HTML
	const htmlBody = await unified()
		.use(remarkParse) // Parse Markdown
		.use(remarkHtml, { sanitize: false }) // Convert to HTML
		.process(content)

	// Wrap the generated HTML in a template
	const html = `
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/public/infima.css" />
    <title>${title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${description ? `<meta name="description" content="${description}" />` : ''}
  </head>
  <body>
    ${htmlBody}
  </body>
</html>
        `

	// Write the final HTML to the output file
	await fs.writeFile(outputFile, html, 'utf8')
	console.log(`Compiled ${inputFile} to ${outputFile}`)
})()
