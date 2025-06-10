# My Devices App

My Devices App is a React application that allows users to manage data about equipment attached to employees. The application utilizes Redux Toolkit for state management and Firebase for data storage.

## Features

- User login via employee ID
- Display of employee information
- Management of associated device records
- Material Design components for a modern user interface

## Technologies Used

- React
- Redux Toolkit
- Firebase
- Material-UI

## Project Structure

```
my-devices-app
├── public
│   └── index.html
├── src
│   ├── app
│   │   └── store.ts
│   ├── components
│   │   ├── DeviceCard.tsx
│   │   ├── DeviceForm.tsx
│   │   └── EmployeeInfo.tsx
│   ├── features
│   │   ├── authSlice.ts
│   │   └── devicesSlice.ts
│   ├── firebase
│   │   └── config.ts
│   ├── pages
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── types
│       └── index.ts
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd my-devices-app
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up your Firebase project and add the configuration to the `.env.local` file.

5. Start the development server:
   ```
   npm start
   ```

## Usage

- Navigate to the login page to enter your employee ID.
- Upon successful login, your employee information and associated devices will be displayed on the dashboard.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.# my-devices-app-1
