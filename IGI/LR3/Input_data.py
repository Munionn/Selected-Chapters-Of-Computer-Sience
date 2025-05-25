import random
import string


def Input_data(promt, data_type, min_value = None, max_value = None):
  """
  args:
  promt(str) promt messager from user 
  data)type: type of user input 
  min_value: minimum allowed value to imput user
  max_value: maxmum allowed value to imput user

  return: valid user input 
  else return value error 
  """

  while True:
    try:
      user_input = data_type(input(promt))
      if min_value is not None and user_input < min_value:
        raise ValueError(f"Value must be greater or equal than {min_value}")
      if max_value is not None and user_input > max_value:
        raise ValueError(f"Value must be lower or equal than {min_value}")
      return user_input;
    except ValueError:
      print(f"Errros : {ValueError}. Please enter one more time");

def Random_Input(datatype, min_value=None, max_value=None):
    """
      fucntion generate random number 
    """
    if datatype == str:
        if min_value is None:
            min_value = 1
        if max_value is None:
            max_value = 50
        generate_value = ''.join(random.choices(
            string.ascii_letters + string.digits,
            k=random.randint(min_value, max_value)
        ))
        return generate_value
  
    if min_value is None:
        min_value = float('-inf')
    if max_value is None:
        max_value = float('inf')

    if datatype == float:
        generate_value = random.uniform(min_value, max_value)
    elif datatype == int:
        generate_value = random.randint(min_value, max_value)
    else:
        raise ValueError("Unsupported data type. Supported types are float, int, str")

    return generate_value
