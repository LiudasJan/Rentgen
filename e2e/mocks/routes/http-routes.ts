import { Express, Request, Response } from 'express';

// Sample Pokemon data for mock responses
const POKEMON_DATA: Record<string, object> = {
  pikachu: {
    id: 25,
    name: 'pikachu',
    abilities: [
      { ability: { name: 'static', url: '/api/ability/static' } },
      { ability: { name: 'lightning-rod', url: '/api/ability/lightning-rod' } },
    ],
    types: [{ type: { name: 'electric' } }],
    height: 4,
    weight: 60,
    sprites: { front_default: 'https://example.com/pikachu.png' },
  },
  charmander: {
    id: 4,
    name: 'charmander',
    abilities: [{ ability: { name: 'blaze', url: '/api/ability/blaze' } }],
    types: [{ type: { name: 'fire' } }],
    height: 6,
    weight: 85,
    sprites: { front_default: 'https://example.com/charmander.png' },
  },
  bulbasaur: {
    id: 1,
    name: 'bulbasaur',
    abilities: [{ ability: { name: 'overgrow', url: '/api/ability/overgrow' } }],
    types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
    height: 7,
    weight: 69,
    sprites: { front_default: 'https://example.com/bulbasaur.png' },
  },
  squirtle: {
    id: 7,
    name: 'squirtle',
    abilities: [{ ability: { name: 'torrent', url: '/api/ability/torrent' } }],
    types: [{ type: { name: 'water' } }],
    height: 5,
    weight: 90,
    sprites: { front_default: 'https://example.com/squirtle.png' },
  },
  ditto: {
    id: 132,
    name: 'ditto',
    abilities: [{ ability: { name: 'limber', url: '/api/ability/limber' } }],
    types: [{ type: { name: 'normal' } }],
    height: 3,
    weight: 40,
    sprites: { front_default: 'https://example.com/ditto.png' },
  },
};

const TYPE_DATA: Record<string, object> = {
  electric: {
    id: 13,
    name: 'electric',
    damage_relations: {
      double_damage_from: [{ name: 'ground' }],
      double_damage_to: [{ name: 'water' }, { name: 'flying' }],
      half_damage_from: [{ name: 'electric' }, { name: 'flying' }, { name: 'steel' }],
      half_damage_to: [{ name: 'electric' }, { name: 'grass' }, { name: 'dragon' }],
      no_damage_from: [],
      no_damage_to: [{ name: 'ground' }],
    },
    pokemon: [{ pokemon: { name: 'pikachu' } }],
  },
};

const ABILITY_DATA: Record<string, object> = {
  static: {
    id: 9,
    name: 'static',
    effect_entries: [
      {
        effect: 'Has a 30% chance of paralyzing attacking Pokemon on contact.',
        language: { name: 'en' },
      },
    ],
    pokemon: [{ pokemon: { name: 'pikachu' } }],
  },
};

export function setupHttpRoutes(app: Express): void {
  // Success responses - User endpoints
  app.get('/api/users', (req: Request, res: Response) => {
    res.json({
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ],
    });
  });

  app.post('/api/users', (req: Request, res: Response) => {
    res.status(201).json({
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    });
  });

  app.put('/api/users/:id', (req: Request, res: Response) => {
    res.json({
      id: parseInt(req.params.id),
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
  });

  app.patch('/api/users/:id', (req: Request, res: Response) => {
    res.json({
      id: parseInt(req.params.id),
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    res.status(204).send();
  });

  // Pokemon-like endpoints (replaces external pokeapi.co)
  app.get('/api/pokemon', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const pokemonNames = Object.keys(POKEMON_DATA);
    const results = pokemonNames.slice(offset, offset + limit).map((name) => ({
      name,
      url: `/api/pokemon/${name}`,
    }));

    res.json({
      count: pokemonNames.length,
      next: offset + limit < pokemonNames.length ? `/api/pokemon?limit=${limit}&offset=${offset + limit}` : null,
      previous: offset > 0 ? `/api/pokemon?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      results,
    });
  });

  app.get('/api/pokemon/:name', (req: Request, res: Response) => {
    const name = req.params.name.toLowerCase();
    const pokemon = POKEMON_DATA[name];

    if (!pokemon) {
      return res.status(404).json({ error: 'Not Found', message: `Pokemon '${name}' not found` });
    }

    res.json(pokemon);
  });

  // Pokemon type endpoint
  app.get('/api/type/:type', (req: Request, res: Response) => {
    const type = req.params.type.toLowerCase();
    const typeData = TYPE_DATA[type];

    if (!typeData) {
      return res.status(404).json({ error: 'Not Found', message: `Type '${type}' not found` });
    }

    res.json(typeData);
  });

  // Pokemon ability endpoint
  app.get('/api/ability/:ability', (req: Request, res: Response) => {
    const ability = req.params.ability.toLowerCase();
    const abilityData = ABILITY_DATA[ability];

    if (!abilityData) {
      return res.status(404).json({ error: 'Not Found', message: `Ability '${ability}' not found` });
    }

    res.json(abilityData);
  });

  // Error responses
  app.get('/api/error/400', (req: Request, res: Response) => {
    res.status(400).json({ error: 'Bad Request', message: 'Invalid input' });
  });

  app.get('/api/error/401', (req: Request, res: Response) => {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
  });

  app.get('/api/error/403', (req: Request, res: Response) => {
    res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
  });

  app.get('/api/error/404', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', message: 'Resource not found' });
  });

  app.get('/api/error/500', (req: Request, res: Response) => {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
  });

  app.get('/api/error/502', (req: Request, res: Response) => {
    res.status(502).json({ error: 'Bad Gateway', message: 'Invalid response from upstream server' });
  });

  app.get('/api/error/503', (req: Request, res: Response) => {
    res.status(503).json({ error: 'Service Unavailable', message: 'Service temporarily unavailable' });
  });

  // Dynamic status code endpoint (replaces httpbin.org/status/:code)
  app.all('/api/status/:code', (req: Request, res: Response) => {
    const code = parseInt(req.params.code);
    if (code >= 100 && code < 600) {
      res.status(code).json({ status: code });
    } else {
      res.status(400).json({ error: 'Invalid status code' });
    }
  });

  // HTTP method endpoints (replaces httpbin.org)
  app.post('/api/post', (req: Request, res: Response) => {
    res.json({
      json: req.body,
      headers: req.headers,
      data: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      form: req.body,
    });
  });

  app.put('/api/put', (req: Request, res: Response) => {
    res.json({
      json: req.body,
      headers: req.headers,
      data: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
    });
  });

  app.patch('/api/patch', (req: Request, res: Response) => {
    res.json({
      json: req.body,
      headers: req.headers,
      data: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
    });
  });

  app.delete('/api/delete', (req: Request, res: Response) => {
    res.json({
      headers: req.headers,
      args: req.query,
    });
  });

  app.get('/api/get', (req: Request, res: Response) => {
    res.json({
      headers: req.headers,
      args: req.query,
      url: req.url,
    });
  });

  // Security test endpoints
  app.get('/api/secure', (req: Request, res: Response) => {
    res.set({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    });
    res.json({ secure: true });
  });

  app.get('/api/insecure', (req: Request, res: Response) => {
    res.json({ secure: false });
  });

  // Slow response for timeout testing
  app.get('/api/slow', (req: Request, res: Response) => {
    const delay = parseInt(req.query.delay as string) || 5000;
    setTimeout(() => {
      res.json({ delayed: true, delay });
    }, delay);
  });

  // Echo endpoint - echoes back request details
  app.all('/api/echo', (req: Request, res: Response) => {
    res.json({
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      path: req.path,
      json: typeof req.body === 'object' ? req.body : null,
      form: req.body,
    });
  });

  // Catch-all for undefined routes (Express 5 compatible)
  app.use((req: Request, res: Response) => {
    res.status(200).json({
      message: 'OK',
      method: req.method,
      path: req.path,
    });
  });
}
