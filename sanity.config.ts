'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { BarChartIcon } from '@sanity/icons'
import { media } from 'sanity-plugin-media'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { resolve } from './sanity/presentation/resolve'
import { DadosDoSite } from './sanity/tools/DadosDoSite'
import { GenerateAIDescription } from './sanity/actions/GenerateAIDescription'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
    media(),
  ],
  tools: [
    {
      name: 'dados-do-site',
      title: 'Dados do Site',
      icon: BarChartIcon,
      component: DadosDoSite,
    },
  ],
  document: {
    actions: (prev) => [...prev, GenerateAIDescription],
  },
})
