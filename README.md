# Bounce Dodge

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJohnPhamous%2Fbounce-dodge&env=NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY&envDescription=The%20Liveblocks%20project%20Public%20Key&envLink=https%3A%2F%2Fliveblocks.io%2Fblog%2Fclient-side-only-mode-with-public-key&project-name=bounce-dodge)

## Getting Started

1. You will need a [Liveblocks account](https://liveblocks.io/)
   1. Set your Liveblock project's Public Key to the `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` environment variable

## How the game works

- Players join the same room
- The 1st player that joins the room is designated the admin. The admin is able to play/pause the game and reset the game state.
- The admin will wait until all players have set their name and placed their sticky note on the canvas before starting the game.
