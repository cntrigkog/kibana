/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { CoreStart, KibanaRequest } from 'kibana/server';
import { IKibanaSearchRequest, IKibanaSearchResponse } from '../../../common';
import { ISearchStrategy } from '../types';
import { ISessionService } from './types';

/**
 * The OSS session service. See data_enhanced in X-Pack for the background session service.
 */
export class SessionService implements ISessionService {
  constructor() {}

  public search<Request extends IKibanaSearchRequest, Response extends IKibanaSearchResponse>(
    strategy: ISearchStrategy<Request, Response>,
    ...args: Parameters<ISearchStrategy<Request, Response>['search']>
  ) {
    return strategy.search(...args);
  }

  public asScopedProvider(core: CoreStart) {
    return (request: KibanaRequest) => ({
      search: this.search,
    });
  }
}
