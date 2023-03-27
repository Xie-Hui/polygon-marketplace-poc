import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
