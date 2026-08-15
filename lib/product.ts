export const product = {
  name: 'Interactive RC Dancing Robot', slug: 'interactive-rc-dancing-robot', price: 6000, offerPrice: 4999,
  delivery: 'Free delivery in Kathmandu · Rs 200 outside Kathmandu',
  images: ['/images/1.png','/images/2.png','/images/3.png','/images/4.png','/images/5.png','/images/6.png','/images/7.png'],
  description: 'A kickass dancing robot with music, a cute cartoon voice, expressive LED emojis, voice control, and lifelike movement that turns playtime into an interactive adventure.',
  benefits: ['8 energetic dance modes and playful music','14 voice commands for interactive play','48 expressive LED face emojis','9 flexible joints powered by 9 strong motors','Remote, voice and app control options','A fun companion for stories, games and dancing'],
  specs: ['Playing time: 2–3 hours','Charging time: 2 hours','Remote requires 2 × AA batteries (not included)','Compatible charger: 5V ≥ 3A output; never overcharge'],
  testimonials: [
    ['“My son absolutely loves this dancing robot! The music, lights, and movements keep him entertained for hours. The remote control is also very easy to use.”','Sushma Karki','Kathmandu','★★★★★'],
    ['“I bought this robot as a birthday gift for my nephew. He became excited as soon as it started dancing. It is fun, interactive, and worth the price.”','Ramesh Thapa','Pokhara','★★★★★'],
    ['“The robot looks attractive and works smoothly. My daughter especially enjoys controlling it and playing the music. A great toy for children.”','Anisha Shrestha','Lalitpur','★★★★☆']
  ],
  faqs: [['What can the robot do?','It can dance, move in different directions, play music and show colourful expressive lights.'],['How is the robot controlled?','Use the included remote control, voice commands or compatible app controls to guide its movements.'],['Is it suitable for children?','Yes. Please check the recommended age on the packaging and supervise younger children.'],['Does it require batteries?','The robot is rechargeable. The remote requires 2 AA batteries, which are not included.'],['What is included in the package?','One dancing robot, one remote control and a user guide. Battery inclusion may vary by product version.'],['How long does delivery take?','We aim to deliver within 24 hours in Kathmandu. Delivery outside Kathmandu is available for Rs 200.']]
};
export const money = (n: number) => `NPR ${n.toLocaleString('en-IN')}`;
