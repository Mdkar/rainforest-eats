# Rainforest Eats 🍌
https://rainforesteats.mihirdhamankar.com

A React-based web application for browsing and searching dining menus across multiple Amazon campus buildings. Designed to help users quickly find food options, compare prices, and discover what's available at various dining locations.

## What It Does

Rainforest Eats aggregates menu data from multiple corporate dining locations, allowing users to:
- Browse menus from different buildings in one place
- Search for specific food items across all locations
- Filter menu items by price
- Customize their experience by hiding unwanted brands or menu categories
- View detailed information about each menu item including prices and locations

## Features

### Building Selection
- Select multiple buildings to view their dining options simultaneously
- Collapsible interface (collapsed by default) to save screen space
- Visual toggle with ⊕/⊖ icons for expand/collapse

### Smart Search
- Real-time search across all menu items
- Search results show item name, description, price, and location
- Clickable items for more details

### Menu Display
- Organized by building, location, and menu category
- Collapsible sections for locations and menu groups (▼ icons)
- Grid layout for easy browsing
- Hover effects for better interactivity

### Customizable Settings
- **Ignored Brands**: Hide specific brands or menu categories you don't want to see
- **Minimum Price Filter**: Set a minimum price threshold to filter out items below a certain price
- Settings persist across sessions using localStorage

### Responsive Design
- Mobile-friendly interface
- Adaptive button labels (e.g., "Location and Settings" on wider screens, icon-only on mobile)
- Grid layouts adjust to screen size

### Performance
- Caching system for menu data
- Loading states and error handling
- Efficient state management with React Context

## Tech Stack

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and uses:
- React with TypeScript
- React Context API for state management
- CSS custom properties for theming
- localStorage for data persistence

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
