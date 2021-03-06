/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { CoreSetup, CoreStart, Logger, Plugin, PluginInitializerContext } from 'kibana/server';
import {
  PluginSetup as DataPluginSetup,
  PluginStart as DataPluginStart,
  usageProvider,
} from '../../../../src/plugins/data/server';
import { UsageCollectionSetup } from '../../../../src/plugins/usage_collection/server';
import { ENHANCED_ES_SEARCH_STRATEGY, EQL_SEARCH_STRATEGY } from '../common';
import { registerSessionRoutes } from './routes';
import { backgroundSessionMapping } from './saved_objects';
import {
  BackgroundSessionService,
  enhancedEsSearchStrategyProvider,
  eqlSearchStrategyProvider,
} from './search';
import { getUiSettings } from './ui_settings';

interface SetupDependencies {
  data: DataPluginSetup;
  usageCollection?: UsageCollectionSetup;
}

export class EnhancedDataServerPlugin implements Plugin<void, void, SetupDependencies> {
  private readonly logger: Logger;
  private sessionService!: BackgroundSessionService;

  constructor(private initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get('data_enhanced');
  }

  public setup(core: CoreSetup<DataPluginStart>, deps: SetupDependencies) {
    const usage = deps.usageCollection ? usageProvider(core) : undefined;

    core.uiSettings.register(getUiSettings());
    core.savedObjects.registerType(backgroundSessionMapping);

    deps.data.search.registerSearchStrategy(
      ENHANCED_ES_SEARCH_STRATEGY,
      enhancedEsSearchStrategyProvider(
        this.initializerContext.config.legacy.globalConfig$,
        this.logger,
        usage
      )
    );

    deps.data.search.registerSearchStrategy(
      EQL_SEARCH_STRATEGY,
      eqlSearchStrategyProvider(this.logger)
    );

    this.sessionService = new BackgroundSessionService(this.logger);

    deps.data.__enhance({
      search: {
        defaultStrategy: ENHANCED_ES_SEARCH_STRATEGY,
        sessionService: this.sessionService,
      },
    });

    const router = core.http.createRouter();
    registerSessionRoutes(router);
  }

  public start(core: CoreStart) {
    this.sessionService.start(core, this.initializerContext.config.create());
  }

  public stop() {
    this.sessionService.stop();
  }
}

export { EnhancedDataServerPlugin as Plugin };
