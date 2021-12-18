// Initializes the `pics` service on path `/pics`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Pics } from './pics.class';
import createModel from '../../models/pics.model';
import hooks from './pics.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'pics': Pics & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/pics', new Pics(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('pics');

  service.hooks(hooks);
}
