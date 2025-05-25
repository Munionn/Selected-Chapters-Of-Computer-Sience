from datetime import datetime
import re
import zipfile

class TextAnalyzer:
    # Class for analyzing a given text
    def __init__(self, text):
        self.text = text

    def count_sentences(self):
        sentences = re.split(r'[.!?]+', self.text)
        return len([sentence for sentence in sentences if sentence.strip()])

    def count_narrative_sentences(self):
        narrative_sentences = re.findall(r'[A-ZА-Я][^.!?]*[.]', self.text)
        return len(narrative_sentences)

    def count_interrogative_sentences(self):
        interrogative_sentences = re.findall(r'[A-ZА-Я][^.!?]*[?]', self.text)
        return len(interrogative_sentences)

    def count_imperative_sentences(self):
        imperative_sentences = re.findall(r'[A-ZА-Я][^.!?]*[!]', self.text)
        return len(imperative_sentences)

    def calculate_average_sentence_length(self):
        sentences = re.split(r'[.!?]+', self.text)
        num_sentences = len([sentence for sentence in sentences if sentence.strip()])
        total_sentence_length = sum(len(sentence) for sentence in sentences if sentence.strip())
        return total_sentence_length / num_sentences if num_sentences > 0 else 0

    def calculate_average_word_length(self):
        words = re.findall(r'\b\w+\b', self.text)
        total_word_length = sum(len(word) for word in words)
        return total_word_length / len(words) if len(words) > 0 else 0

    def count_smileys(self):
        smileys = re.findall(r'[;:]-*[()\[\]]+', self.text)
        return len(smileys)

    def find_sentences_with_patterns(self):
        pattern = r'[^.!?]*[0-9\s\W]+[^.!?]*[.!?]'
        sentences = re.findall(pattern, self.text)
        return sentences

    def is_valid_date(self):
        date_pattern = r'\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/([1-9][6-9]\d{2}|[2-9]\d{3})\b'
        found_dates = re.finditer(date_pattern, self.text)

        valid_dates = []
        for match in found_dates:
            day, month, year = map(int, match.groups())
            try:
                datetime(year, month, day) 
                valid_dates.append(match.group(0))
            except ValueError:
                continue

        return valid_dates

    def count_upper_and_lower(self):
        upper_count = len(re.findall(r'[A-ZА-Я]', self.text))
        lower_count = len(re.findall(r'[a-zа-я]', self.text))
        return upper_count, lower_count

    def find_first_word_with_z(self):
        words = re.split(r'\s+', self.text)
        for index, word in enumerate(words):
            if re.search(r'z', word, re.IGNORECASE):
                return word, index + 1
        return None, None

    def exclude_words_starting_with_a(self):
        # Exclude words starting with 'a' or 'A'
        pattern = r'\b[Aa][^\s]*\b'
        return re.sub(pattern, '', self.text).strip()


class DataWorker(TextAnalyzer):
    # Class for working with data, inherits from TextAnalyzer
    def __init__(self, input_file):
        # Initializes the DataWorker with an input file
        self.input_file = input_file
        self.text = self.read_file()

    def read_file(self):
        # Reads the input file and returns its contents as text
        try:
            with open(self.input_file, "r", encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            print(f"File {self.input_file} not found.")
            return ""

    def analyze_text(self):
        # Analyzes the text and returns the analysis results as a string
        num_sentences = self.count_sentences()
        num_narrative_sentences = self.count_narrative_sentences()
        num_interrogative_sentences = self.count_interrogative_sentences()
        num_imperative_sentences = self.count_imperative_sentences()
        average_sentence_length = self.calculate_average_sentence_length()
        average_word_length = self.calculate_average_word_length()
        num_smileys = self.count_smileys()
        sentences_with_patterns = self.find_sentences_with_patterns()
        upper_count, lower_count = self.count_upper_and_lower()
        first_word_with_z, word_index = self.find_first_word_with_z()
        text_without_a = self.exclude_words_starting_with_a()
        valid_date = self.is_valid_date()
        output_content = ""
        output_content += f"Number of sentences in the text: {num_sentences}\n"
        output_content += f"Number of narrative sentences: {num_narrative_sentences}\n"
        output_content += f"Number of interrogative sentences: {num_interrogative_sentences}\n"
        output_content += f"Number of imperative sentences: {num_imperative_sentences}\n"
        output_content += f"Average sentence length in characters: {average_sentence_length:.2f}\n"
        output_content += f"Average word length in characters: {average_word_length:.2f}\n"
        output_content += f"Number of smileys in the text: {num_smileys}\n"
        output_content += f"Sentences with spaces, numbers, and symbols: {sentences_with_patterns}\n"
        output_content += f"Number of uppercase letters: {upper_count}\n"
        output_content += f"Number of lowercase letters: {lower_count}\n"
        output_content += f"First word containing 'z': {first_word_with_z}, position: {word_index}\n"
        output_content += f"Text without words starting with 'a': {text_without_a}\n"
        output_content += f"All valid date: {valid_date}\n"
        return output_content


def write_file(output_file, content):
    # Writes the provided content to the output file
    with open(output_file, "w", encoding="utf-8") as file:
        file.write(content)


def create_zip_archive(output_file, file_to_archive):
    # Creates a zip archive containing the provided file
    with zipfile.ZipFile(output_file, 'w', compression=zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.write(file_to_archive)
        archive_info = zip_file.getinfo(file_to_archive)
        print("File name in archive: {}".format(archive_info.filename))
        print("Compressed file size: {} bytes".format(archive_info.compress_size))
        print("Uncompressed file size: {} bytes".format(archive_info.file_size))
        print("Compression method: {}".format(archive_info.compress_type))


def task2():
    data_worker = DataWorker("Task2_input.txt")
    output_content = data_worker.analyze_text()

    # Save analysis results to a file
    write_file("Task2_output.txt", output_content)

    # Print the content of the output file
    with open("Task2_output.txt", "r", encoding="utf-8") as file:
        file_content = file.read()
        print(file_content)

    # Create a zip archive
    create_zip_archive("Task2_res.zip", "Task2_output.txt")

