'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { BarChartIcon } from '@sanity/icons'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { DadosDoSite } from './sanity/tools/DadosDoSite'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  tools: [
    {
      name: 'dados-do-site',
      title: 'Dados do Site',
      icon: BarChartIcon,
      component: DadosDoSite,
    },
  ],
})
