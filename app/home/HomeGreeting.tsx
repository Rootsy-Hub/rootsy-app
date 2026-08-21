import Image from "next/image"
import { HOME_COPY } from "@/app/home/homeCopy"
import { menuRealmLightMutedClass, menuRealmTitleClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import rootsySaludo from "./rootsy-saludo.png"

type HomeGreetingProps = {
  displayName: string
  namePending?: boolean
}

export function HomeGreeting({ displayName, namePending = false }: HomeGreetingProps) {
  return (
    <div className="w-full max-w-xl text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <h1 className={cn("text-balance text-3xl sm:text-4xl", menuRealmTitleClass)}>
          {namePending ? (
            <span
              className="inline-block h-8 w-44 align-middle animate-pulse rounded-md bg-white/12 sm:h-9 sm:w-56"
              aria-hidden
            />
          ) : (
            HOME_COPY.greeting(displayName)
          )}
        </h1>
        <Image
          src={rootsySaludo}
          alt="Rootsy"
          priority
          className="-translate-y-3 h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24"
        />
      </div>
      <p className={cn("mt-2 text-base sm:text-lg", menuRealmLightMutedClass)}>
        {HOME_COPY.lead}
      </p>
    </div>
  )
}
