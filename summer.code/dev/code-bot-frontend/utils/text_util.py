def preprocess_text(text, line_length):
    cleaned_string = text.replace('\n', '')
    lines = [cleaned_string[i:i + line_length] for i in range(0, len(cleaned_string), line_length)]
    output_string = '\n'.join(lines)
    length = len(lines[0])
    return output_string, length, len(lines)