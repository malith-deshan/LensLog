// Photography categories used across the whole app
export const CATEGORIES = [
  'Portrait',
  'Landscape',
  'Street',
  'Nature',
  'Wildlife',
  'Macro',
  'Architecture',
  'Night',
  'Food',
];

// Built-in photography ideas. These are inserted into SQLite once.
export const SEED_IDEAS = [
  // ---------- Portrait ----------
  {
    id: 1,
    title: 'Window Light Portrait',
    category: 'Portrait',
    description:
      'Place your subject near a large window and use the soft natural light as your only light source. Turn them slightly toward the window for gentle shadows.',
    iso: '200',
    aperture: 'f/2.0',
    shutterSpeed: '1/200s',
  },
  {
    id: 2,
    title: 'Golden Hour Backlit Portrait',
    category: 'Portrait',
    description:
      'Position the sun behind your subject shortly before sunset to create a warm glowing rim of light around their hair and shoulders.',
    iso: '100',
    aperture: 'f/2.8',
    shutterSpeed: '1/500s',
  },
  {
    id: 3,
    title: 'Environmental Portrait',
    category: 'Portrait',
    description:
      'Photograph a person in the place that tells their story, such as a craftsperson in a workshop. Keep the background detailed enough to add context.',
    iso: '400',
    aperture: 'f/4',
    shutterSpeed: '1/160s',
  },

  // ---------- Landscape ----------
  {
    id: 4,
    title: 'Sunrise Mountain Vista',
    category: 'Landscape',
    description:
      'Arrive before dawn and shoot a wide scene as the first light touches the peaks. Use a tripod and keep the horizon level.',
    iso: '100',
    aperture: 'f/11',
    shutterSpeed: '1/125s',
  },
  {
    id: 5,
    title: 'Long Exposure Waterfall',
    category: 'Landscape',
    description:
      'Use a slow shutter speed on a tripod to turn flowing water into smooth silky streaks. Overcast days work best to avoid blown highlights.',
    iso: '100',
    aperture: 'f/16',
    shutterSpeed: '2s',
  },
  {
    id: 6,
    title: 'Seascape at Sunset',
    category: 'Landscape',
    description:
      'Compose with waves or rocks in the foreground and the glowing sky behind. Watch the horizon and protect your lens from sea spray.',
    iso: '100',
    aperture: 'f/9',
    shutterSpeed: '1/60s',
  },

  // ---------- Street ----------
  {
    id: 7,
    title: 'Decisive Moment Street Shot',
    category: 'Street',
    description:
      'Find an interesting background, then wait for a person to walk into the frame at the perfect moment. Patience matters more than gear.',
    iso: '400',
    aperture: 'f/8',
    shutterSpeed: '1/250s',
  },
  {
    id: 8,
    title: 'Rainy Street Reflections',
    category: 'Street',
    description:
      'Shoot after rain and look for puddles that mirror neon signs and passers-by. Get low to capture the reflections.',
    iso: '800',
    aperture: 'f/2.8',
    shutterSpeed: '1/125s',
  },
  {
    id: 9,
    title: 'Alley Light Silhouettes',
    category: 'Street',
    description:
      'Expose for the bright light at the end of an alley so people walking through become dark graphic silhouettes.',
    iso: '200',
    aperture: 'f/5.6',
    shutterSpeed: '1/500s',
  },

  // ---------- Nature ----------
  {
    id: 10,
    title: 'Forest Light Rays',
    category: 'Nature',
    description:
      'Visit a misty forest in the early morning and look for sunbeams cutting through the trees. Expose for the highlights to keep the rays dramatic.',
    iso: '400',
    aperture: 'f/5.6',
    shutterSpeed: '1/100s',
  },
  {
    id: 11,
    title: 'Dewdrops on Leaves',
    category: 'Nature',
    description:
      'Early morning dew turns ordinary leaves into sparkling subjects. Shoot at a low angle and let the background blur into soft colors.',
    iso: '200',
    aperture: 'f/4',
    shutterSpeed: '1/200s',
  },
  {
    id: 12,
    title: 'Autumn Color Patterns',
    category: 'Nature',
    description:
      'Fill the frame with fallen leaves or a colorful canopy to create abstract patterns. A polarizing filter deepens the colors.',
    iso: '100',
    aperture: 'f/8',
    shutterSpeed: '1/125s',
  },

  // ---------- Wildlife ----------
  {
    id: 13,
    title: 'Bird in Flight',
    category: 'Wildlife',
    description:
      'Use continuous autofocus and a very fast shutter speed to freeze wing movement. Pan smoothly with the bird.',
    iso: '800',
    aperture: 'f/5.6',
    shutterSpeed: '1/2000s',
  },
  {
    id: 14,
    title: 'Animal Portrait with Telephoto',
    category: 'Wildlife',
    description:
      'Keep your distance and use a long lens to fill the frame. Focus on the eye and let the background blur away.',
    iso: '400',
    aperture: 'f/5.6',
    shutterSpeed: '1/1000s',
  },
  {
    id: 15,
    title: 'Wildlife at Dusk',
    category: 'Wildlife',
    description:
      'Animals are most active at dawn and dusk. Raise the ISO to keep a fast enough shutter speed in the fading light.',
    iso: '1600',
    aperture: 'f/4',
    shutterSpeed: '1/500s',
  },

  // ---------- Macro ----------
  {
    id: 16,
    title: 'Insect on a Flower',
    category: 'Macro',
    description:
      'Approach slowly in the cool morning when insects move less. Focus on the eyes and keep the sensor parallel to the subject.',
    iso: '200',
    aperture: 'f/8',
    shutterSpeed: '1/250s',
  },
  {
    id: 17,
    title: 'Water Drop Reflections',
    category: 'Macro',
    description:
      'Photograph a single droplet and look for the tiny upside-down world reflected inside it. Use a plain colorful background behind it.',
    iso: '400',
    aperture: 'f/11',
    shutterSpeed: '1/200s',
  },
  {
    id: 18,
    title: 'Texture of a Feather',
    category: 'Macro',
    description:
      'Get close to reveal the fine structure of a feather. Side lighting makes the texture stand out.',
    iso: '100',
    aperture: 'f/5.6',
    shutterSpeed: '1/160s',
  },

  // ---------- Architecture ----------
  {
    id: 19,
    title: 'Symmetrical Building Facade',
    category: 'Architecture',
    description:
      'Stand in the center and align the camera so both sides mirror each other. Keep vertical lines straight to avoid distortion.',
    iso: '100',
    aperture: 'f/8',
    shutterSpeed: '1/200s',
  },
  {
    id: 20,
    title: 'Spiral Staircase from Below',
    category: 'Architecture',
    description:
      'Stand at the bottom and shoot straight up to capture the hypnotic curves. A wide-angle lens works best.',
    iso: '400',
    aperture: 'f/5.6',
    shutterSpeed: '1/60s',
  },
  {
    id: 21,
    title: 'Cathedral Interior Lines',
    category: 'Architecture',
    description:
      'Use the leading lines of arches and columns to guide the eye. Brace the camera on a pillar if tripods are not allowed.',
    iso: '800',
    aperture: 'f/5.6',
    shutterSpeed: '1/60s',
  },

  // ---------- Night ----------
  {
    id: 22,
    title: 'Milky Way Astrophotography',
    category: 'Night',
    description:
      'Find a dark sky location away from city lights, mount the camera on a tripod, and use a wide fast lens. Keep exposures short enough to avoid star trails.',
    iso: '3200',
    aperture: 'f/2.8',
    shutterSpeed: '20s',
  },
  {
    id: 23,
    title: 'City Light Trails',
    category: 'Night',
    description:
      'Shoot from a bridge or elevated spot and use a long exposure so moving cars become glowing streaks of light.',
    iso: '100',
    aperture: 'f/11',
    shutterSpeed: '15s',
  },
  {
    id: 24,
    title: 'Moonlit Landscape',
    category: 'Night',
    description:
      'A bright moon lights the scene like a soft sun. Use a tripod and a longer exposure to capture the quiet blue tones.',
    iso: '1600',
    aperture: 'f/2.8',
    shutterSpeed: '8s',
  },

  // ---------- Food ----------
  {
    id: 25,
    title: 'Overhead Flat Lay',
    category: 'Food',
    description:
      'Arrange dishes, props, and ingredients on a clean surface and shoot straight down. Use window light from the side.',
    iso: '200',
    aperture: 'f/5.6',
    shutterSpeed: '1/125s',
  },
  {
    id: 26,
    title: 'Side-Lit Dessert Shot',
    category: 'Food',
    description:
      'Get low and place the light to the side or slightly behind the dessert to highlight texture. Use a wide aperture for a creamy background.',
    iso: '200',
    aperture: 'f/2.8',
    shutterSpeed: '1/125s',
  },
];

export const CATEGORY_ICONS = {
  Portrait: 'person',
  Landscape: 'image',
  Street: 'walk',
  Nature: 'leaf',
  Wildlife: 'paw',
  Macro: 'flower',
  Architecture: 'business',
  Night: 'moon',
  Food: 'restaurant',
};