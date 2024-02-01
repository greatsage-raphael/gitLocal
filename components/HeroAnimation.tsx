"use client"
import React, { useState, useEffect, useMemo } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "./button"
import CodeDisplay from "./CodeDisplay"
import { Input } from "./input"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import clsx from "clsx"

type Props = {}

const noop = () => {}

const examples = [
  {
    // English input
    code: `
    #Function to extract host information from URL
    def get_host_info(url):
        parsed_url = urllib.parse.urlparse(url)
        host = parsed_url.netloc
        return host
`,
    input: "English",
  },
  {
    // Chinese input
    code: `
    #从给定 URL 中提取主机信息的函数
    def get_host_info(url):
    parsed_url = urllib.parse.urlparse(url)
    host = parsed_url.netloc
    return host
`,
    input: "Chinese",
  },
].map((example) => {
  const code = example.code.trim()
  return {
    ...example,
    code,
    codeChunks: extractChunks(code, 5),
    inputChunks: extractChunks(example.input, 1),
  }
})

const Tranalatedexamples = [
  {
    // chinese translation
    code: `
    uyusyiuyiu
`,
    input: "English",
  },
  {
    // english translation
    code: `
    wewrfwh
`,
    input: "Chinese",
  },
].map((example) => {
  const code = example.code.trim()
  return {
    ...example,
    code,
    codeChunks: extractChunks(code, 5),
    inputChunks: extractChunks(example.input, 1),
  }
})

export const numExamples = examples.length

function extractChunks(code: string, chunkSize: number = 5): string[] {
  const chunks = []
  for (let i = 0; i < code.length; i += chunkSize) {
    chunks.push(code.substring(i, i + chunkSize))
  }
  return chunks
}

const CHUNK_DELAY_MS = 50
const STEP_BUFFERS = {
  waitingForLLM: 10,
  waitBeforeSubmit: 10,
  submittingCode: 50,
}

export default function HeroAnimation({}: Props) {
  const [animateContainerRef] = useAutoAnimate()
  const [submittingContainerRef, enable] = useAutoAnimate({})

  const [exampleIndex, setExampleIndex] = useState(0)
  const [TranslatedIndex, setTranslatedIndex] = useState(0)
  const example = examples[exampleIndex]!
  const translation = Tranalatedexamples[TranslatedIndex]!

  const [step, setStep] = useState(0)

  const stepMilestones = useMemo(() => {
    const endInput = example.inputChunks.length
    const startGeneratingCode = endInput + STEP_BUFFERS.waitingForLLM
    const startSubmitting =
      startGeneratingCode + example.codeChunks.length + STEP_BUFFERS.waitBeforeSubmit
    const total = startSubmitting + STEP_BUFFERS.submittingCode

    return {
      input: endInput,
      startGeneratingCode,
      startSubmitting,
      total,
    }
  }, [example])

  const currentInputChunkIndex = Math.min(step, stepMilestones.input)
  const currentCodeChunkIndex = Math.max(
    0,
    step - example.inputChunks.length - STEP_BUFFERS.waitingForLLM
  )
  const showLoader =
    step > stepMilestones.startGeneratingCode && step < stepMilestones.startSubmitting
  const showSubmittingFakeModal = step > stepMilestones.startSubmitting
  const complete = step === stepMilestones.total

  const inputToShow = example.inputChunks.slice(0, currentInputChunkIndex).join("")
  const codeToShow = example.codeChunks.slice(0, currentCodeChunkIndex).join("")

  const TranslatedCode = translation.codeChunks.slice(0, currentCodeChunkIndex).join("")

  useEffect(() => {
    let nextExampleTimeout: ReturnType<typeof setTimeout>
    const stepInterval = setInterval(() => {
      let complete = false
      setStep((step) => {
        if (step === stepMilestones.total) {
          complete = true
        }
        return Math.min(step + 1, stepMilestones.total)
      })

      if (complete) {
        nextExampleTimeout = setTimeout(() => {
          setExampleIndex((exampleIndex) => (exampleIndex + 1) % numExamples)
          setStep(0)
        }, 5_000)
        clearInterval(stepInterval)
      }
    }, CHUNK_DELAY_MS)

    return () => {
      clearInterval(stepInterval)
      if (nextExampleTimeout) {
        clearTimeout(nextExampleTimeout)
      }
    }
  }, [example, stepMilestones])

  // For testing
  // const showSubmittingFakeModal = true
  // const complete = true
  // const inputToShow = example.input
  // const codeToShow = example.code

  const showSubmittingOpacityClass = showSubmittingFakeModal && "opacity-40"

  return (
    <div
      className="flex flex-col justify-center items-center relative rounded-t-xl rounded-b overflow-hidden"
      ref={animateContainerRef}
    >
      {codeToShow ? (
        <div
          className={clsx(
            "bg-dracula w-full rounded-xl overflow-y-scroll h-full transition-all",
            showSubmittingOpacityClass
          )}
        >
          <CodeDisplay code={codeToShow} language="python" />
        </div>
      ) : null}
      <div
        className={clsx(
          "mt-4 flex w-full pointer-events-none transition-all",
          showSubmittingOpacityClass
        )}
      >
        <Input
          value={inputToShow}
          id="message"
          name="message"
          placeholder="Type your instructions..."
          autoComplete="off"
          required
          disabled={showLoader}
          // this is to stop React's warning about controlled inputs
          onChange={noop}
        />
        <Button type="submit" disabled={false}>
          {showLoader ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="w-5 h-5" />}

          <span className="sr-only">Send</span>
        </Button>
      </div>

      <div>
        {showSubmittingFakeModal && (
          <div className="absolute inset-0 grid place-items-center animate-fade-in">
            <div className="bg-zinc-600 py-4 px-6 rounded">
              {complete ? (
                <CodeDisplay code={TranslatedCode} language="python" />
              ) : (
                <div className="flex items-center gap-4">
                  Translating Code Comments
                  <Loader2 size={16} className="animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}