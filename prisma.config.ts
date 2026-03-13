import path from "path"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: path.join(process.cwd(), "prisma/schema.prisma"),
})
