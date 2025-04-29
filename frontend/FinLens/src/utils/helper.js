import moment from 'moment';

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validatePassword = (password) => {
    if (!password) {
      return "Please enter the password";
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }
    return ''; // Return an empty string if the password is valid
};

//Utility to extract initials from a name
export const getInitials = (name) => {
    if(!name) return "";

    const words = name.split(" ");
    let initials = "";

    for(let i = 0; i<Math.min(words.length, 2); i++){
        initials += words[i][0];
    }

    return initials.toUpperCase();

};

//Utility to seprate place values from amounts
export const addThousandsSeperator = (num) => {

  const value = parseFloat(num).toFixed(2);
  const [integerPart, fractionalPart] = value.split(".");

  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);

  const formattedInteger = otherNumbers
    .replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? "," : "") + lastThree;

  return `Rs. ${formattedInteger}.${fractionalPart}`;
};

//Utility to give bar chart its data
export const prepareExpenseBarChartData = (data= []) =>{
  const chartData = data.map((item) => ({
    category: item?.category,
    amount: item?.amount
  }));

  return chartData;
};

export const prepareIncomeBarChartData = (data = []) => {
  const sortedData = [...data].sort((a,b) => new Date(a.date) - new Date(b.date));

  const chartData = sortedData.map((item) =>({
    month : moment(item?.date).format("Do MMM"),
    amount: item?.amount,
    source: item?.source,
  }));

  return chartData;
}

//Utility to give expense Area chart its data
export const prepareExpenseLineChartData = (data = []) =>{
  // sorting
  const sortedData = [...data].sort((a,b)=> new Date(a.date) - new Date(b.date))
   // mapping formatted data
  const chartData = sortedData.map((item)=>({
    month: moment(item?.date).format('Do MMM'),
    amount: item?.amount,
    category: item?.category,
  }))

  return chartData;
};




