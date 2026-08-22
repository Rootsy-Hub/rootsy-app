"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { useHomeSaludoHover } from "@/app/home/HomeSaludoHover"
import "@/app/home/homeEter.css"
import { menuRealmLightMutedClass, menuRealmTitleClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import rootsySaludoInicial from "../../public/logos/rootsy/rootsy-saludo-inicial.png"
import rootsySaludo from "../../public/logos/rootsy/rootsy-saludo.png"

type HomeGreetingProps = {
  displayName: string
  namePending?: boolean
}

export function HomeGreeting({ displayName, namePending = false }: HomeGreetingProps) {
  const { hello } = useHomeSaludoHover()

  return (
    <div className="w-full max-w-xl text-center">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
        <h1
          className={cn(
            "text-balance text-[1.7rem] leading-tight sm:text-3xl md:text-4xl",
            menuRealmTitleClass,
          )}
        >
          {namePending ? (
            <span
              className="inline-block h-7 w-40 align-middle animate-pulse rounded-md bg-white/12 sm:h-8 sm:w-44 md:h-9 md:w-56"
              aria-hidden
            />
          ) : (
            HOME_COPY.greeting(displayName)
          )}
        </h1>
        <span
          className={cn(
            "home-rootsy-saludo order-first sm:order-0 sm:-translate-y-3",
            hello && "is-hello",
          )}
          aria-hidden
        >
          <img
            src={rootsySaludoInicial.src}
            alt=""
            className="home-rootsy-saludo__idle"
          />
          <img
            src={rootsySaludo.src}
            alt=""
            className="home-rootsy-saludo__hello"
          />
        </span>
      </div>
      <p className={cn("mt-1.5 text-[0.95rem] sm:mt-2 sm:text-base md:text-lg", menuRealmLightMutedClass)}>
        {HOME_COPY.lead}
      </p>
    </div>
  )
}
