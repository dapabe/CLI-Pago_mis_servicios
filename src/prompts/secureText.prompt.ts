import { SafeExitMessage } from "@/constants/random";
import { PasswordOptions, TextOptions, cancel, isCancel, password, text } from "@clack/prompts";
import picocolors from "picocolors";
import { exit } from "process";

type Options = Extract<TextOptions,PasswordOptions>

export async function secureTextPrompt(secureMode:boolean,options:Options){
  if(secureMode) {
    const answer = await password({
      message: `${options.message} ${options.placeholder ? `(${options.placeholder})`:""} ${options.initialValue ? picocolors.blue("[Presione <enter> para devolver el valor existente]"):""}`,
      validate: options.validate,
      mask:"*"
    })

    if(isCancel(answer)){
      cancel(SafeExitMessage)
      exit(0)
    }
    return answer
  }

  const answer =  await text({
    message: options.message,
    initialValue: options.initialValue,
    placeholder: options.placeholder,
    validate: options.validate
  })

  if(isCancel(answer)){
    cancel(SafeExitMessage)
    exit(0)
  }

  return answer
}
