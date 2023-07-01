import { Game } from "@/components/game";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="hidden h-max flex-col md:flex">
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <h2 className="text-lg font-semibold whitespace-nowrap">
          Bounce Dodge
        </h2>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end">0</div>
      </div>
      <Separator />
      <div className="container h-full py-6">
        <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
          <div className="hidden flex-col space-y-4 sm:flex md:order-2">
            <div className="grid gap-2">yo</div>
          </div>
          <Game />
        </div>
      </div>
    </div>
  );
}
