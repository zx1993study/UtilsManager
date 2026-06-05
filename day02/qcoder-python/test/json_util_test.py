from tempfile import template

from utils.swagger_parser import *
import json



def test_json_parser():
    json_str = json.loads(open('test.json', 'r').read())
    swagger_obj = parse_swagger_to_api_info(json_str,10)
    for api in swagger_obj.apis:
        templates = parse_swagger_to_templates(json_str, 10)
        print(templates)
