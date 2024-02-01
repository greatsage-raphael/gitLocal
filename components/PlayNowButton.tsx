"use client"

import { Button } from "./button"
import Link from "next/link"

type PlayNowButtonProps = {}
const PlayNowButton = (props: PlayNowButtonProps) => {
  
  return (
    <Button asChild>
      <Link href="/g">Play now</Link>
    </Button>
  )
}

export default PlayNowButton