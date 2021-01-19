import React from 'react'
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  HatenaIcon,
  HatenaShareButton,
} from 'react-share'

type Props = {
  text: string
  url: string
}

export default ({ text, url }: Props) => {
  return (
    <>
      <ul>
        <li>
          <TwitterShareButton url={url} title={text}>
            <TwitterIcon size={32} round={true} />
          </TwitterShareButton>
        </li>
        <li>
          <FacebookShareButton url={url}>
            <FacebookIcon size={32} round={true} />
          </FacebookShareButton>
        </li>
        <li>
          <HatenaShareButton url={url}>
            <HatenaIcon size={32} round={true} />
          </HatenaShareButton>
        </li>
      </ul>
      <style jsx>{`
        ul {
          list-style: none;
        }
      `}</style>
    </>
  )
}
