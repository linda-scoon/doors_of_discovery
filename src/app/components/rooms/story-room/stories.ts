/**
 * Fifty short adventures, each starring whoever is reading. `{name}` is
 * replaced with the name they give. Kept short enough to read in a doorway.
 */
export interface Story {
  title: string;
  text: string;
  /** A story set at night or underground is told in the dark. */
  mood?: 'dark';
}

export const STORIES: readonly Story[] = [
  {
    title: 'The Door at the End of the Wall',
    text: 'Everyone said the wall of doors went on forever, but {name} kept walking anyway. Past the green doors, past the stuck ones, past one that hummed. At the very end stood a door no bigger than a book. {name} knelt, turned the tiny handle, and found a whole sky inside, with a ladder leading up. Some people would have gone home. {name} climbed.',
  },
  {
    title: 'Captain {name} and the Paper Ship',
    text: 'The ship was folded from a single page of an old atlas, but when {name} set it on the puddle it grew and grew until it had sails like clouds. The crew were sparrows. The map was the ship itself. "Where to, Captain {name}?" chirped the first mate. {name} pointed at the bit of the page that said Here Be Dragons, and the sparrows cheered.',
  },
  {
    title: 'The Lighthouse That Forgot',
    mood: 'dark',
    text: 'The old lighthouse had forgotten how to shine. Ships bumped about in the fog, grumbling. {name} climbed its two hundred stairs with a jar of fireflies and a very good idea. At the top, {name} let them out, and they swirled into the great glass lamp and lit it brighter than it had ever been. The ships blew their horns all night to say thank you.',
  },
  {
    title: 'The Dragon Who Was Scared of Mice',
    text: 'The dragon of Grimstone Hill had not left its cave in a hundred years, and the village assumed it was planning something terrible. {name} went to find out. Inside, the dragon was standing on a chair, trembling. A mouse sat in the middle of the floor. {name} picked the mouse up, carried it outside, and became the dragon\'s best friend on the spot.',
  },
  {
    title: 'Six Minutes on the Moon',
    text: 'The rocket was meant to be a school project, built from bottles and hope. Nobody expected it to work. But at three o\'clock exactly it roared, and {name} found themselves standing on the Moon, holding a packed lunch. There was just time for a sandwich, a handful of moon dust, and a wave at the Earth. Then the rocket beeped, and {name} hopped home.',
  },
  {
    title: 'The Clockwork Fox',
    text: 'In the window of a dusty toyshop sat a fox made of brass and springs. When {name} wound it up, it blinked, stretched, and said, "At last. Someone with sense." It led {name} through the back of the shop, down a spiral stair, and into a city where every street ticked. "We need a mechanic," said the fox. {name} rolled up their sleeves.',
  },
  {
    title: 'The Underground Sea',
    mood: 'dark',
    text: 'Behind the coal cellar, past a door marked DO NOT, there was a sea. Not a puddle, a proper sea, with waves and a pier and a little rowing boat with {name}\'s name already painted on the side. Glowing fish lit the water from below. {name} rowed out into the dark and sang to keep brave, and something enormous and friendly hummed back.',
  },
  {
    title: 'The Great Pie Heist',
    text: 'The Queen\'s prize pie had been stolen, and the only clue was a trail of crumbs and a single feather. {name} followed the crumbs to the bakery, the feather to the bell tower, and found the thief at the top: a goose, very sorry and very full. {name} struck a deal. The goose would help bake a new pie, and nobody would say a word.',
  },
  {
    title: 'The Kite That Kept Going',
    text: 'It was the windiest day of the year, and {name}\'s kite would not come down. It pulled, and pulled, and lifted {name} off the hill, over the town, and into the clouds, where a kingdom of kites lived among the gusts. They held a parade in {name}\'s honour and let {name} steer the wind for an afternoon. Then the kite flew {name} home for tea.',
  },
  {
    title: 'The Library of Lost Things',
    text: 'Every odd sock, every missing key, every forgotten umbrella ends up in the same place: a library under the sea, where the librarian is an octopus. {name} arrived looking for a lost marble and stayed to help sort the shelves. It took eight arms and two very patient hands. When {name} left, the octopus gave {name} a library card that opened any door.',
  },
  {
    title: 'The Night the Museum Woke Up',
    mood: 'dark',
    text: 'At midnight, the dinosaur in the museum yawned. The knights clanked down from the walls, the mummies stretched, and the paintings started arguing. {name}, who had fallen asleep behind a statue, was the only living person there. The dinosaur wanted to play fetch. The knights wanted a referee. By dawn, {name} had organised the best party the museum had ever seen.',
  },
  {
    title: 'The Snow Bear\'s Map',
    mood: 'dark',
    text: 'Far in the north, where the snow squeaks underfoot, a bear knocked on {name}\'s door holding a map. "The northern lights have gone missing," it said. "We think they are hiding." {name} packed a flask of cocoa and followed the bear across the ice, to a cave where the lights were curled up, shy. {name} told them a joke, and they shimmered out laughing.',
  },
  {
    title: 'The Volcano with Hiccups',
    text: 'The volcano on Ember Island had hiccups. Every few minutes it went HIC and threw out a shower of glowing pebbles. The islanders were exhausted. {name} sailed over, climbed right to the top, and shouted "BOO!" down into the crater. There was a long, rumbling silence. Then the volcano sighed with relief, and the islanders threw {name} a feast.',
  },
  {
    title: 'The Train to Tuesday',
    text: 'Platform Nine stopped at Monday, Wednesday and Saturday. But one foggy morning, a little green train pulled in with a sign that said Tuesday, Somehow. {name} hopped on. It rattled through a field of sunflowers, a tunnel of stars, and a town where it was always teatime. "End of the line," said the conductor, a badger, and tipped his hat to {name}.',
  },
  {
    title: 'The Giant\'s Garden',
    text: 'The giant was gentle but terribly clumsy, and every time he watered his garden he flooded the village. {name} climbed the beanstalk with a bucket of ideas. Together they built gutters, channels and a waterwheel, and by the end of the week the giant\'s garden was blooming and the village had its very own river. The giant named a sunflower after {name}.',
  },
  {
    title: 'The Pirate Who Couldn\'t Swim',
    text: 'Captain Blackwhistle was the most feared pirate on the seven seas, and had a secret: he could not swim. When he fell overboard chasing his own hat, it was {name}, passing in a pedal boat, who fished him out. He was so grateful he gave {name} his treasure map, his parrot, and his solemn promise never to be fearsome again. Mostly.',
  },
  {
    title: 'The Secret of the Stuck Door',
    text: 'One door on the wall never opened. People pushed it, pulled it, kicked it. {name} simply knocked and said, "Hello? Is anyone in there?" There was a pause, a creak, and a small voice: "Nobody ever asks." The door swung wide onto a room full of everything people had ever hoped to find behind a door. {name} was invited back any time.',
  },
  {
    title: 'The Balloon Race',
    text: 'There were twelve balloons in the great race around the world, and {name}\'s was the smallest, patched with tea towels. While the others fought over the fastest winds, {name} drifted low, chatting to geese, who knew all the shortcuts. Over the mountains, across the ocean, and down into the finish field, first by a whisker. The geese got medals too.',
  },
  {
    title: 'The Mermaid\'s Lost Comb',
    text: 'A mermaid surfaced beside {name}\'s fishing boat in a terrible state. Her comb, made from moonlight, had been swallowed by a whale. {name} rowed out to the whale, who was only grumpy because he had a sore tummy. {name} gave him a peppermint. The whale burped, the comb shot out, and the mermaid sang {name} a song that made the sea sparkle for a week.',
  },
  {
    title: 'The Robot Who Wanted to Dance',
    text: 'In the factory at the edge of town, Robot 7 was built to stack boxes. But whenever the radio played, its feet started tapping. {name} found it practising alone after closing time, and took it to the town dance. Robot 7 was terrible at first, then good, then astonishing. By midnight the whole town was copying its moves, and {name} was teaching them.',
  },
  {
    title: 'The Desert of Singing Sand',
    text: 'In the middle of the desert, the dunes sing when the wind blows. Travellers say that if you can sing back in tune, the sand will show you a hidden oasis. {name} was not the best singer in the world, but {name} was the most determined. After the forty-third try, the dunes harmonised, the sand parted, and there was water, palm trees and a very surprised camel.',
  },
  {
    title: 'The Haunted Wardrobe',
    mood: 'dark',
    text: 'The wardrobe at Gran\'s house rattled at night. Everyone was too frightened to look. {name} opened it with a torch and found a very small ghost wearing a very big coat. "It\'s cold being a ghost," it explained. {name} knitted it a scarf. Now the wardrobe hums happily at night, and Gran\'s socks are mysteriously always folded.',
  },
  {
    title: 'The Comet\'s Tail',
    text: 'A comet was passing so close to Earth that {name} could have touched it from the roof. So {name} did. The comet\'s tail was soft and fizzy, like holding lemonade, and before {name} could let go, they were whooshing past Saturn, waving at the rings. The comet dropped {name} home on its way back round, seventy-six years later in comet time, which is about ten minutes.',
  },
  {
    title: 'The Knight Who Lost Her Horse',
    text: 'Sir Marigold had lost her horse, her helmet, and most of her patience. {name} found her sitting on a milestone, sighing. Together they followed hoofprints into the Whispering Wood, where the horse had made friends with a family of deer and did not want to leave. {name} suggested they all come along. Sir Marigold rode home at the head of a herd.',
  },
  {
    title: 'The Cave of Crystals',
    mood: 'dark',
    text: 'Deep beneath the mountain, the crystals grow in every colour there is and a few there aren\'t. They are said to show you what you are brave enough to see. {name} climbed down, rope by rope, until the cave lit up around them. In the biggest crystal was a picture of {name}, standing on top of the mountain, grinning. So {name} went and did exactly that.',
  },
  {
    title: 'The Cloud Kingdom',
    text: 'Every cloud you have ever seen is a house in the Cloud Kingdom, and they drift about to visit each other. {name} arrived by accident, on a gust, and was given a job as a weather inspector. It involved bouncing on clouds to test their fluffiness, which {name} turned out to be very good at. The king made {name} Chief Bouncer for life.',
  },
  {
    title: 'The Lost City of Copper',
    text: 'The old explorer\'s notebook ended mid-sentence: "The city is beneath the third waterfall, and the key is—". {name} found the waterfall, then the cave behind it, then a door of green copper with no keyhole at all. {name} thought for a long time. Then {name} said "please." The door slid open onto streets of copper and a city waiting to be found.',
  },
  {
    title: 'The Snail Express',
    text: 'The snails had an important message to carry to the far side of the garden, and at their usual speed it would arrive next spring. {name} lent them a skateboard. It was the fastest any snail has ever travelled, and they talked about it for generations. The message, delivered just in time, was an invitation to {name}\'s own surprise birthday party.',
  },
  {
    title: 'The Owl Who Couldn\'t Sleep',
    mood: 'dark',
    text: 'Owls sleep in the day, but this owl could not. The sun was too bright, the birds too noisy, the bees too busy. {name} built it a little tent of leaves, hummed it a lullaby, and kept watch. When the owl woke at dusk, rested at last, it took {name} on a night flight over the woods and showed them every secret path.',
  },
  {
    title: 'The Ice Palace',
    mood: 'dark',
    text: 'The ice palace only appears on the coldest night of the year, and only to people who are out walking when they should be in bed. {name} was one of those people. Inside, everything glittered, and the Snow Queen was terribly lonely. {name} taught her to make hot chocolate. It melted a wall or two, but she said it was worth it.',
  },
  {
    title: 'The Treasure Under the Bed',
    mood: 'dark',
    text: 'Everyone has a monster under their bed. {name}\'s monster had a map. "There\'s treasure under every bed," it whispered, "if you know where to dig." Together they tunnelled through the dust bunnies, past a lost shoe and a forgotten biscuit, to a chest of gold coins. They were chocolate. {name} and the monster agreed it was the best kind.',
  },
  {
    title: 'The Sky Pirates',
    text: 'The airship Gallivant flew under a flag of patchwork, and its crew were the kindest pirates in the sky: they only ever stole bad weather. When a storm threatened {name}\'s town, they swooped down and invited {name} aboard. Together they lassoed the thundercloud and towed it out to sea, where it rained happily on nobody at all.',
  },
  {
    title: 'The Painting That Was a Window',
    text: 'In the hallway hung a painting of a meadow, and one day {name} noticed the grass in it was moving. {name} put a hand to the frame and stepped through. The meadow smelled of summer. A painted rabbit offered directions. {name} spent the whole afternoon there, and when they climbed back out, there was a small painted {name} in the picture, waving.',
  },
  {
    title: 'The Bakery of Wishes',
    text: 'The bakery on Crumb Street sold bread that granted small wishes: a sunny day, a found pencil, a good dream. One day the baker fell ill, and {name} took over the ovens. The first loaves came out lopsided. The second wished for slightly too much rain. But by the end of the week, {name}\'s bread was granting the best wishes in town.',
  },
  {
    title: 'The Tortoise and the Rocket',
    text: 'The tortoise had always wanted to go fast. Just once. {name} built him a rocket out of a teapot and a firework, and they launched from the garden at dawn. The tortoise went faster than any tortoise in history, looped the chimney, and landed in the pond with a splash. "Again," said the tortoise. So they did, every Sunday after that.',
  },
  {
    title: 'The Jungle River',
    text: 'The river through the jungle twisted like a ribbon, and it was said nobody had ever reached its end. {name} paddled for three days, past singing frogs and sleepy crocodiles and a waterfall that fell upward. At the very end was a little pool, perfectly still, with {name}\'s own reflection in it, holding a sign: "Well done. Now go home and tell everyone."',
  },
  {
    title: 'The Scarecrow\'s Holiday',
    text: 'The scarecrow had stood in the same field for forty years and had never seen the sea. {name} offered to stand in for him for a week. The crows were puzzled, but polite. The scarecrow came back with a sunburn, a bucket and spade, and a postcard addressed to {name} that said: "Wish you were here. Thank you for being here instead."',
  },
  {
    title: 'The Mirror Maze',
    text: 'At the fair, the mirror maze had a sign: ONLY ONE WAY OUT. Inside, every reflection of {name} did something slightly different. One waved. One winked. One pointed left. {name} followed the pointing one through a hundred turns and came out not at the exit, but in a whole mirror-world fair, where the candyfloss tasted backwards and was delicious.',
  },
  {
    title: 'The Whale Song',
    text: 'The whales had forgotten the last verse of their oldest song, and without it they could not find their way home. {name} spent a whole summer on the cliffs, listening, writing down every note. On the last day of summer, {name} played the full song on a tin whistle from the end of the pier. The whales sang along, turned, and swam home.',
  },
  {
    title: 'The Castle in the Teacup',
    text: 'When {name} looked into their tea, there was a castle in it, flying a tiny flag. A tiny knight on the battlements shouted, "Help! A biscuit is sinking our moat!" {name} carefully fished out the biscuit with a spoon. The knight declared {name} a hero of the realm, and from then on, {name}\'s tea was always exactly the right temperature.',
  },
  {
    title: 'The Night Market',
    mood: 'dark',
    text: 'Once a year, when the moon is full, a market appears in the empty car park, run by foxes, badgers and a very old hedgehog. They sell bottled moonlight, maps to places that do not exist, and second-hand dreams. {name} had no money, so traded a really good joke. The hedgehog laughed so hard it gave {name} a lantern that never goes out.',
  },
  {
    title: 'The Dinosaur Egg',
    text: 'The stone {name} found on the beach was warm, and it was ticking. By morning it had hatched into a baby dinosaur the size of a cat, who wanted breakfast very badly. {name} raised it on porridge and kindness, and when it grew too big for the garden, {name} took it to a valley where its family had been waiting for sixty-five million years.',
  },
  {
    title: 'The Windmill\'s Wish',
    text: 'The windmill on the hill wished it could see the other side of the world. {name} could not move a windmill, but {name} could do the next best thing. Every day, {name} climbed to the top and described a different country, from the books in the library. The windmill turned happily, and the bread it made that year tasted of adventure.',
  },
  {
    title: 'The Submarine Picnic',
    text: 'The yellow submarine was the size of a garden shed, and it had room for exactly one explorer and one picnic basket. {name} took it down, down, down, to the bottom of the ocean, where the fish had never seen a sandwich. {name} shared. By the end of the afternoon there was a crowd of squid, eels and one very polite shark, all asking for the recipe.',
  },
  {
    title: 'The Echo Who Talked Back',
    text: 'In the valley, when you shout, the echo shouts back. But one day, when {name} called "Hello!", the echo said, "Oh, hello! You\'re new." It turned out the echo had been lonely for years, repeating other people\'s words. {name} sat on the hillside all afternoon and let it tell its own stories. They were mostly about mountains, and very long.',
  },
  {
    title: 'The Stargazer\'s Telescope',
    mood: 'dark',
    text: 'The telescope in the attic was so old that it did not look at stars; it looked at what the stars were doing. Through it, {name} saw two stars playing chess, a constellation having a nap, and one small star, lost. {name} drew it a map in chalk on the roof. That night, a new star appeared in exactly the right place, and twinkled at {name}.',
  },
  {
    title: 'The Toyshop After Dark',
    text: 'When the toyshop closes, the toys hold an election. This year the teddy bear and the tin soldier were tied, and they needed one more vote. {name}, locked in by accident, was the only one who could break the tie. {name} voted for both of them to share. The toys had never thought of that, and threw a parade in {name}\'s honour.',
  },
  {
    title: 'The Mountain That Moved',
    text: 'The mountain was in the way of the sun, and the village in its shadow was always cold. {name} climbed up and asked it, very politely, if it might shift a little. The mountain had never been asked anything before. It thought about it for a whole day, then shuffled three steps to the left. The village had its first sunny morning in a thousand years.',
  },
  {
    title: 'The Last Door',
    text: 'After a thousand doors, {name} reached one that was plain and brown and perfectly ordinary. Behind it was a small room with a chair, a lamp, and a book with {name}\'s name on the cover. Every page was a different adventure, and every adventure had {name} in it. The last page was blank. Underneath, in small letters, it said: "Your turn to write one."',
  },
  {
    title: 'The Grand Adventure of {name}',
    text: 'It began, as the best adventures do, with a door that should not have been there. {name} opened it and found a bridge across a canyon, a forest of silver trees, a castle full of riddles, and a dragon who only wanted directions. {name} solved the riddles, helped the dragon, crossed back over the bridge, and was home in time for dinner, with a story nobody believed.',
  },
];
